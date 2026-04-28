// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Simple Register Route
router.post('/register', (req, res) => {
    const { name, email, role } = req.body;
    console.log(`New User: ${name} (${role})`);
    res.status(201).json({ message: "User registered successfully", user: { name, email, role } });
});

// Simple Login Route
router.post('/login', (req, res) => {
    const { email, role } = req.body;
    console.log(`Login Attempt: ${email} as ${role}`);
    // Here you would normally check the password in the database
    res.status(200).json({ message: "Login successful", user: { email, role } });
});

module.exports = router;