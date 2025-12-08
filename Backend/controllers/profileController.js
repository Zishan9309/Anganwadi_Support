// controllers/profileController.js
const Profile = require('../models/Profile');

exports.createProfile = async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    console.error('createProfile error', err);
    res.status(400).json({ error: err.message || 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findById(id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('getProfile error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Profile.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Profile not found' });
    res.json(updated);
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(400).json({ error: err.message || 'Server error' });
  }
};
