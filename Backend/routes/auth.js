const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', async (req, res) => {
  console.log('📝 Register attempt - Body:', req.body);  // Debug log
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existingUser  = await User.findOne({ email });
    if (existingUser ) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create and save user
    console.log('🔄 Creating user...');
    const user = new User({ email, password });
    await user.save();
    console.log('✅ User saved:', user._id);

    const token = generateToken(user._id);
    res.status(201).json({ 
      token, 
      user: { id: user._id, email: user.email } 
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (error.message.includes('timed out')) {
      return res.status(500).json({ error: 'Database timeout - Check connection' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('🔑 Login attempt - Body:', req.body);  // Debug log
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', user.email);
    const token = generateToken(user._id);
    res.json({ 
      token, 
      user: { id: user._id, email: user.email } 
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;