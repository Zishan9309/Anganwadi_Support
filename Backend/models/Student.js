const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  id: String,
  date: { type: String, required: true }, // YYYY-MM-DD
  present: { type: Boolean, default: false },
  mealProvided: { type: Boolean, default: false },
  activities: [String],
});

const nutritionRecordSchema = new mongoose.Schema({
  date: { type: String, required: true },
  weight: Number,
  height: Number,
  nutritionStatus: { type: String, enum: ['healthy', 'at-risk', 'malnourished'], default: 'healthy' },
});

const immunizationRecordSchema = new mongoose.Schema({
  id: String,
  vaccineName: String,
  dateGiven: String,
  // ✅ UPDATED: Added 'confirmed' to the enum list
  status: { 
    type: String, 
    enum: ['completed', 'pending', 'overdue', 'confirmed'], 
    default: 'pending' 
  },
});

const healthRecordSchema = new mongoose.Schema({
  id: String,
  date: String,
  checkupType: String,
  findings: String,
  recommendations: String
});

const studentSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  parentName: { type: String, required: true },
  parentPhoneNumber: { type: String},
  weight: Number,
  height: Number,
  dateOfBirth: String,
  address: String,
  attendanceRecords: [attendanceRecordSchema],
  nutritionRecords: [nutritionRecordSchema],
  immunizationStatus: [immunizationRecordSchema],
  healthRecords: [healthRecordSchema],
  
}, { timestamps: true });



// Indexes
studentSchema.index({ profileId: 1 });
studentSchema.index({ name: 1 });

module.exports = mongoose.model('Student', studentSchema);