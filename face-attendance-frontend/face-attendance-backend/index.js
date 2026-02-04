require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = require('canvas');

const morgan = require('morgan');

// Initialize App
const app = express();

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/face-attendance-db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Load Face API Models
const runFaceApi = async () => {
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, 'models_weights'));
        await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, 'models_weights'));
        await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, 'models_weights'));
        console.log('FaceAPI Models Loaded');
    } catch (err) {
        console.error('Error loading FaceAPI models:', err);
    }
};
runFaceApi();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
