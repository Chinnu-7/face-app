const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'employee'],
        default: 'student',
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true,
    },
    phoneNumber: {
        type: String,
    },
    faceDescriptor: {
        type: [Number], // Array of 128 floats
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema);
