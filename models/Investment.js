const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  returnAmount: { type: Number, required: true },
  durationInHours: { type: Number, default: 6 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  cycleCompleted: { type: Boolean, default: false },
  approvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Investments', investmentSchema);
