const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const { check } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Memory storage is fine for face processing, but we should validate
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST api/auth/register
// @desc    Register user & get token
// @access  Public
router.post('/register', [
    upload.single('image'),
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

module.exports = router;
