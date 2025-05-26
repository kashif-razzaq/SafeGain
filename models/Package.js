const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  baseProfitPercent: { type: Number, default: 10 },
  durationInHours: { type: Number, default: 6 }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
