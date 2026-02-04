const Attendance = require('../models/Attendance');
const User = require('../models/User');
const faceapi = require('face-api.js');
const geolib = require('geolib');
const { Canvas, Image, ImageData } = require('canvas');
const { Op } = require('sequelize');

// Monkey patch face-api env
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

exports.markAttendance = async (req, res) => {
    try {
        const { location } = req.body;
        const userLoc = JSON.parse(location || '{}');

        // Geofencing Check
        const officeCenter = { latitude: 17.3850, longitude: 78.4867 };
        if (userLoc.lat && userLoc.lng) {
            const distance = geolib.getDistance(
                { latitude: userLoc.lat, longitude: userLoc.lng },
                officeCenter
            );
            if (distance > 500) {
                return res.status(403).json({ msg: 'You are outside the permitted work area' });
            }
        } else {
            return res.status(400).json({ msg: 'Location data is required' });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No image uploaded' });
        }

        // Detect Face
        const img = await faceapi.bufferToImage(req.file.buffer);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (!detections) {
            return res.status(400).json({ msg: 'No face detected' });
        }

        const uploadedDescriptor = detections.descriptor;

        // Fetch all users with descriptors (Note: faceDescriptor is stored as JSON which is retrieved as an object/array in Sequelize)
        const users = await User.findAll({
            where: {
                faceDescriptor: { [Op.ne]: null }
            }
        });

        let bestMatch = null;
        let minDistance = 0.6;

        if (users.length === 0) {
            return res.status(400).json({ msg: 'No registered face data found' });
        }

        const faceMatcher = new faceapi.FaceMatcher(users.map(u =>
            new faceapi.LabeledFaceDescriptors(u.id.toString(), [new Float32Array(u.faceDescriptor)])
        ), minDistance);

        const match = faceMatcher.findBestMatch(uploadedDescriptor);

        if (match.label === 'unknown') {
            return res.status(400).json({ msg: 'Face not recognized' });
        }

        const userId = match.label;
        const today = new Date().toISOString().split('T')[0];

        const existing = await Attendance.findOne({
            where: {
                userId,
                date: today
            }
        });

        if (existing) {
            return res.status(400).json({ msg: 'Attendance already marked for today' });
        }

        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];

        let status = 'Present';
        if (now.getHours() >= 10 && now.getMinutes() > 0) {
            status = 'Late';
        }

        await Attendance.create({
            userId,
            date: today,
            time: timeString,
            location: userLoc,
            status,
            photoProof: req.file.buffer.toString('base64')
        });

        res.json({ msg: 'Attendance marked', status, user: userId });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getHistory = async (req, res) => {
    try {
        const attendance = await Attendance.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
