const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  verifiedReferralsCount: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isPhoneVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetTokenExpires: { type: Date },
  cashAppId: { type: String },
  cashAppQr: { type: String }, // URL to uploaded QR code image
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  bonusEarned: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
