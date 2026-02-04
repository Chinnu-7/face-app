const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
    },
    time: {
        type: String, // Format: HH:mm:ss
        required: true,
    },
    location: {
        lat: Number,
        lng: Number,
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Absent'],
        default: 'Present',
    },
    photoProof: {
        type: String, // Base64 encoded image or URL
    },
}, { timestamps: true });

AttendanceSchema.index({ user: 1, date: -1 });
AttendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
