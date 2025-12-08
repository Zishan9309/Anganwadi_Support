const express = require('express');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const router = express.Router();

// 🛑 FIX: NEW ROUTE - Handles GET /api/profiles
// Fetches the profile associated with the currently logged-in userId (from the JWT).
router.get('/', auth, async (req, res) => {
    console.log('👤 Get profile by user ID attempt for user:', req.user.userId);
    try {
        const profile = await Profile.findOne({ userId: req.user.userId });
        
        if (!profile) {
            console.log('❌ No profile found for user on GET /profiles');
            // 404 is sent back if the profile hasn't been created yet.
            return res.status(404).json({ error: 'Profile not yet created for this user.' });
        }
        
        console.log('✅ Profile found:', profile._id);
        res.json(profile);
    } catch (error) {
        console.error('❌ GET /profiles error:', error.message);
        res.status(500).json({ error: 'Server error fetching profile.' });
    }
});
// ----------------------------------------------------

// Get profile by ID (Existing code, unchanged)
router.get('/:id', auth, async (req, res) => {
  console.log('👤 Get profile attempt for ID:', req.params.id);
  try {
    const profile = await Profile.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create profile (Existing code, unchanged)
router.post('/', auth, async (req, res) => {
  console.log('📝 Create profile attempt - Body:', req.body);
  try {
    const profileData = { ...req.body, userId: req.user.userId };
    const profile = new Profile(profileData);
    await profile.save();
    console.log('✅ Profile saved:', profile._id);
    res.status(201).json(profile);
  } catch (error) {
    console.error('❌ Create profile error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Update profile (Your existing update route, which was missing in your paste)
router.put('/:id', auth, async (req, res) => {
  console.log('✏️ Update profile attempt for ID:', req.params.id);
  try {
    const profile = await Profile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;