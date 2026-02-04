const Attendance = require('../models/Attendance');
const User = require('../models/User');
const faceapi = require('face-api.js');
const geolib = require('geolib');
const { Canvas, Image, ImageData } = require('canvas');

// Monkey patch face-api env
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

exports.markAttendance = async (req, res) => {
    try {
        const { location } = req.body; // location = { lat, lng }
        const userLoc = JSON.parse(location || '{}');

        // 1. Geofencing Check (e.g., 500 meters from office center)
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

        // Detect Face from Upload
        const img = await faceapi.bufferToImage(req.file.buffer);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (!detections) {
            return res.status(400).json({ msg: 'No face detected' });
        }

        const uploadedDescriptor = detections.descriptor;

        // Fetch all users with descriptors
        const users = await User.find({ faceDescriptor: { $exists: true, $not: { $size: 0 } } });

        let bestMatch = null;
        let minDistance = 0.6; // Threshold

        const faceMatcher = new faceapi.FaceMatcher(users.map(u =>
            new faceapi.LabeledFaceDescriptors(u.id.toString(), [new Float32Array(u.faceDescriptor)])
        ), minDistance);

        const match = faceMatcher.findBestMatch(uploadedDescriptor);

        if (match.label === 'unknown') {
            return res.status(400).json({ msg: 'Face not recognized' });
        }

        // Found User
        const userId = match.label;

        // Check if already marked for today
        const today = new Date().toISOString().split('T')[0];
        const existing = await Attendance.findOne({ user: userId, date: today });

        if (existing) {
            return res.status(400).json({ msg: 'Attendance already marked for today' });
        }

        // Mark Attendance
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];

        // Simple Lat/Long Logic (10am)
        let status = 'Present';
        if (now.getHours() >= 10 && now.getMinutes() > 0) {
            status = 'Late';
        }

        const attendance = new Attendance({
            user: userId,
            date: today,
            time: timeString,
            location: JSON.parse(location || '{}'),
            status,
            photoProof: req.file ? req.file.buffer.toString('base64') : undefined
        });

        await attendance.save();
        res.json({ msg: 'Attendance marked', status, user: userId });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getHistory = async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
