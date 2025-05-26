const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');
const { generateToken } = require('../utils/generateToken');

exports.register = async (req, res) => {
  const { name, email, password, referredBy } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const referralCode = `SG${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      referralCode,
      referredBy
    });
    if (req.body.referredBy) {
      const referrer = await User.findOne({ referralCode: req.body.referredBy });
      if (referrer) {
        referrer.referrals.push(newUser._id);
        referrer.verifiedReferralsCount += 1;
        referrer.status = 'pending'; // Mark as active if they have verified referrals
        await referrer.save();
      }
    }

    const token = generateToken(newUser._id);

    await sendEmail(email, 'welcome', {
      name: newUser.name || 'SafeGainer'
    });

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { email, name } = req.body; // Token verification already done client-side
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name:name || 'Google user', email, password: await bcrypt.hash(email, 10) });
  }
  const token = generateToken(user._id);
  res.json({ token, user });
};

exports.sendOtp = async (req, res) => {
  // Firebase handles OTP. Frontend only calls this for UI tracking/log.
  res.json({ message: 'OTP sent via Firebase client' });
};

exports.verifyOtp = async (req, res) => {
  const userId = req.user.id;
  await User.findByIdAndUpdate(userId, { isPhoneVerified: true });
  res.json({ message: 'Phone verified' });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetTokenExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  if (!user) return res.status(400).json({ message: 'User not found' });
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendEmail(email, 'resetPassword', {
  name: user.email,
  link: resetLink
  });

  res.json({ message: 'Reset email sent' });
};

exports.resetPassword = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetTokenExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  
  res.json({ message: 'Password reset successful' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

