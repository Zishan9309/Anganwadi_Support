const mongoose = require('mongoose');

const awcImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageData: { type: String, required: true }, // Base64 string
    capturedAt: { type: Date, required: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AWCImage', awcImageSchema);