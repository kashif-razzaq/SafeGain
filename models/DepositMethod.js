const mongoose = require('mongoose');

const depositMethodSchema = new mongoose.Schema({
  title: { type: String, required: true },           // e.g., USDT (TRC-20)
  address: { type: String, required: true },         // wallet address
  qrImage: { type: String },                         // optional QR code URL
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  instructions: {type: String}
}, { timestamps: true });

module.exports = mongoose.model('DepositMethod', depositMethodSchema);
