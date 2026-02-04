const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST api/attendance/mark
// @desc    Mark attendance
// @access  Private (or Public if using face only, but let's assume valid user check handled in controller)
router.post('/mark', upload.single('image'), attendanceController.markAttendance);

// @route   GET api/attendance/history
// @desc    Get attendance history
// @access  Private
router.get('/history', auth, attendanceController.getHistory);

module.exports = router;
