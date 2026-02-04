const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// @route   GET api/departments
// @desc    Get all departments
// @access  Public
router.get('/', async (req, res) => {
    try {
        const departments = await Department.findAll({ order: [['name', 'ASC']] });
        res.json(departments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
