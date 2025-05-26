const express = require('express');
const router = express.Router();
const user = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Withdrawal = require('../models/Withdrawal');


router.get('/profile', authMiddleware, user.getProfile);
router.put('/update-password', authMiddleware, user.updatePassword);
router.get('/dashboard', authMiddleware, user.getDashboardData);
router.get('/transactions', authMiddleware, user.getUserTransactions);
router.get('/me', authMiddleware, user.getProfile);
router.patch('/settings', authMiddleware, user.updateSettings);
router.post('/upload-qr', authMiddleware, upload.single('image'), user.uploadQr);
router.patch('/change-password', authMiddleware, user.updatePassword);
router.get('/withdrawals/my', authMiddleware, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('Withdrawals fetch error:', err);
    res.status(500).json({ message: 'Failed to load withdrawals' });
  }
});


module.exports = router;
