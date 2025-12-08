const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },  // Fixed ref
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  anganwadiCenterName: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  awwId: { type: String, required: true, unique: true },
  language: { type: String, default: 'hindi', enum: ['hindi', 'english'] },
}, { timestamps: true });

// Index for queries
profileSchema.index({ userId: 1 });
profileSchema.index({ awwId: 1 });

module.exports = mongoose.model('Profile', profileSchema);