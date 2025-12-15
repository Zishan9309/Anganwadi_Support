const express = require('express');
const router = express.Router();
const AWCImage = require('../models/AWCImage');
const auth = require('../middleware/auth');

// Upload Image
// POST /api/images/upload
router.post('/upload', auth, async (req, res) => {
    try {
        const { imageData, capturedAt, notes } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ error: "Image data is required" });
        }

        const newImage = new AWCImage({
            userId: req.user.userId,
            imageData, // Storing Base64 string directly
            capturedAt: capturedAt || new Date(),
            notes
        });

        await newImage.save();
        res.status(201).json({ message: "Image uploaded successfully", image: newImage });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Failed to upload image" });
    }
});

// Get User's Latest Image (for preview)
// GET /api/images/latest
router.get('/latest', auth, async (req, res) => {
    try {
        const latestImage = await AWCImage.findOne({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(latestImage || null);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch image" });
    }
});

// Get All Images (for gallery)
// GET /api/images
router.get('/', auth, async (req, res) => {
    try {
        const images = await AWCImage.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

module.exports = router;