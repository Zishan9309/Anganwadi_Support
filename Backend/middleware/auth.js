const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  console.log('🔐 Auth middleware - Checking token...');  // Debug log
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('❌ No Authorization header');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    console.log('❌ Invalid token format');
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('✅ Token valid for userId:', decoded.userId);
    next();
  } catch (ex) {
    console.log('❌ Token verification failed:', ex.message);
    res.status(400).json({ error: 'Invalid token.' });
  }
};