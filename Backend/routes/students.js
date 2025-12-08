const express = require('express');
const mongoose = require('mongoose');  // Added for connection check
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const router = express.Router();

// Helper to check if DB is connected
const isDBConnected = () => mongoose.connection.readyState === 1;

// Get all students
router.get('/', auth, async (req, res) => {
  console.log('📚 Get all students attempt for user:', req.user.userId);
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database not ready - Please try again' });
    }

    const profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      console.log('❌ No profile found for user:', req.user.userId);
      return res.status(404).json({ error: 'Profile not found' });
    }
    console.log('🔍 Found profile:', profile._id);

    const students = await Student.find({ profileId: profile._id }).sort({ name: 1 });
    console.log(`✅ Found ${students.length} students`);
    res.json(students);
  } catch (error) {
    console.error('❌ Get students error:', error.message);
    if (error.message.includes('timed out')) {
      return res.status(500).json({ error: 'Database timeout - Check connection' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  console.log('👶 Get student attempt for ID:', req.params.id, 'user:', req.user.userId);
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database not ready - Please try again' });
    }

    const profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const student = await Student.findOne({ _id: req.params.id, profileId: profile._id });
    if (!student) {
      console.log('❌ Student not found:', req.params.id);
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('✅ Student found:', student.name);
    res.json(student);
  } catch (error) {
    console.error('❌ Get student error:', error.message);
    if (error.message.includes('timed out')) {
      return res.status(500).json({ error: 'Database timeout - Check connection' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Add student
router.post('/', auth, async (req, res) => {
  console.log('➕ Add student attempt - Body:', req.body, 'user:', req.user.userId);
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database not ready - Please try again' });
    }

    const profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      console.log('❌ No profile for add student');
      return res.status(404).json({ error: 'Profile not found' });
    }
    console.log('🔍 Profile found for add:', profile._id);

    // Ensure nested arrays are initialized if missing
    const studentData = {
      ...req.body,
      profileId: profile._id,
      attendanceRecords: req.body.attendanceRecords || [],
      nutritionRecords: req.body.nutritionRecords || [],
      immunizationStatus: req.body.immunizationStatus || [],
      healthRecords: req.body.healthRecords || [],
    };

    console.log('🔄 Creating student...');
    const student = new Student(studentData);
    await student.save();
    console.log('✅ Student saved:', student._id, student.name);

    res.status(201).json(student);
  } catch (error) {
    console.error('❌ Add student error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate student data (e.g., name)' });
    }
    if (error.message.includes('timed out')) {
      return res.status(500).json({ error: 'Database timeout during save - Try again' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update student (supports nested fields like attendanceRecords)
router.put('/:id', auth, async (req, res) => {
  console.log('✏️ Update student attempt for ID:', req.params.id, 'updates:', req.body);
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database not ready - Please try again' });
    }

    const profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    console.log('🔄 Updating student...');
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, profileId: profile._id },
      { $set: req.body },  // $set handles nested updates safely
      { new: true, runValidators: true }
    );
    if (!student) {
      console.log('❌ Student not found for update:', req.params.id);
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('✅ Student updated:', student.name);
    res.json(student);
  } catch (error) {
    console.error('❌ Update student error:', error.message);
    if (error.message.includes('timed out')) {
      return res.status(500).json({ error: 'Database timeout during update - Try again' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', auth, async (req, res) => {
  console.log('🗑️ Delete student attempt for ID:', req.params.id, 'user:', req.user.userId);
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database not ready - Please try again' });
    }

    const profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const student = await Student.findOneAndDelete({ _id: req.params.id, profileId: profile._id });
    if (!student) {
      console.log('❌ Student not found for delete:', req.params.id);
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('✅ Student deleted:', student.name);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('❌ Delete student error:', error.message);
    if (error.message.includes('timed out')) {
      return res.status(500).json({ error: 'Database timeout during delete - Try again' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;