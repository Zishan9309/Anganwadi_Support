const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('DEBUG: Loading env...');
console.log('DEBUG: PORT=', process.env.PORT);
console.log('DEBUG: MONGODB_URI=', process.env.MONGODB_URI ? `Loaded (length: ${process.env.MONGODB_URI.length})` : 'UNDEFINED!');
console.log('DEBUG: JWT_SECRET=', process.env.JWT_SECRET ? 'Loaded' : 'UNDEFINED!');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI missing! Check .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Disable Mongoose buffering globally to prevent timeouts
mongoose.set('bufferCommands', false);

// Middleware (before routes)
app.use(cors({ origin: '*' }));  // Allow all for dev; restrict later
app.use(express.json({ limit: '10mb' }));  // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // For form data if needed

// Test route (no DB needed)
app.get('/', (req, res) => {
  res.json({ message: 'Anganwadi Backend API is running!' });
});

// Connect to MongoDB with simplified, supported options
const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempting MongoDB connection (attempt ${i + 1}/${retries})...`);
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,  // 30s to select server (helps with Atlas)
        socketTimeoutMS: 45000,  // 45s socket timeout
        // No deprecated or problematic options
      });
      console.log('✅ MongoDB connected successfully to:', conn.connection.host);
      console.log('✅ Database name:', conn.connection.name);
      return conn;  // Success, return connection
    } catch (err) {
      console.error(`❌ Connection attempt ${i + 1} failed:`);
      console.error('Message:', err.message);
      if (i === retries - 1) {
        console.error('Full error:', err);
        throw err;  // Final failure
      }
      console.log('⏳ Retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));  // Wait 5s before retry
    }
  }
};

// Load routes only after connection
const loadRoutes = () => {
  try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/profiles', require('./routes/profiles'));
    app.use('/api/students', require('./routes/students'));
    // NEW ROUTE ADDED: AWC Data Explorer
    app.use('/', require('./routes/public')); 

    console.log('✅ All routes loaded successfully');
  } catch (error) {
    console.error('❌ Error loading routes:', error.message);
    process.exit(1);
  }
};

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server ONLY after DB connects
const startServer = async () => {
  try {
    await connectDB();
    loadRoutes();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server - Exiting');
    process.exit(1);
  }
};

startServer();
