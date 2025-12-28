const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_123', {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
    console.log("Signup Request Body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        console.log("Signup Error: Missing fields");
        return res.status(400).json({ error: 'Please include all fields' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log("Signup Error: User exists");
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({
            email,
            password
        });

        if (user) {
            console.log("Signup Success:", user._id);
            res.status(201).json({
                _id: user._id,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            console.log("Signup Error: Invalid user data");
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Signup Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
