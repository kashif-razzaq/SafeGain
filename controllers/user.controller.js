const Investment = require('../models/Investment');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Withdrawal = require('../models/Withdrawal');
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name email cashAppId cashAppQr referralCode referrals bonusEarned')
      .populate('referrals', 'name email');

    const activeInvestment = await Investment.findOne({
      user: user._id,
      status: 'approved',
      cycleCompleted: false
    });

    const lastWithdrawal = await Withdrawal.findOne({ user: user._id }).sort({ createdAt: -1 });

    // Load referral statuses
    const referralStatuses = await Promise.all(
      user.referrals.map(async (refUser) => {
        const hasInvestment = await Investment.findOne({
          user: refUser._id,
          status: 'approved'
        });
        return {
          _id: refUser._id,
          name: refUser.name,
          email: refUser.email,
          status: hasInvestment ? 'active' : 'pending'
        };
      })
    );
    const investments = await Investment.find({
      user: req.user._id,
      status: 'approved',
      cycleCompleted: false
    });

    for (let inv of investments) {
      const endTime = new Date(inv.approvedAt).getTime() + inv.durationInHours * 60 * 60 * 1000;
      if (Date.now() >= endTime) {
        inv.cycleCompleted = true;
        await inv.save();

        const userToUpdate = await User.findById(inv.user);
        userToUpdate.walletBalance += inv.returnAmount;
        await userToUpdate.save();
      }
    }
    // Single clean response
    res.json({
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      cashAppId: user.cashAppId,
      cashAppQr: user.cashAppQr,
      bonusEarned: user.bonusEarned,
      referrals: referralStatuses,
      activeInvestment,
      lastWithdrawalStatus: lastWithdrawal?.status || null
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
};


// PATCH /user/settings
exports.updateSettings = async (req, res) => {
  try {
    const { cashAppId } = req.body;
    await User.findByIdAndUpdate(req.user._id, { cashAppId });
    res.json({ message: 'Settings updated' });
  } catch {
    res.status(500).json({ message: 'Failed to update settings' });
  }
};
// POST /user/upload-qr
exports.uploadQr = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { cashAppQr: imageUrl });
    res.json({ url: imageUrl });
  } catch {
    res.status(500).json({ message: 'QR upload failed' });
  }
};


exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!await bcrypt.compare(oldPassword, user.password)) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated' });
};


exports.getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    // 1. Check and mark completed cycles
    const investments = await Investment.find({
      user: user._id,
      status: 'approved',
      cycleCompleted: false
    });

    for (let inv of investments) {
      const endTime = new Date(inv.approvedAt).getTime() + inv.durationInHours * 60 * 60 * 1000;

      const withdrawal = await Withdrawal.findOne({ user: inv.user, cycleId: inv._id });

      if (Date.now() >= endTime && !inv.cycleCompleted) {
        inv.cycleCompleted = true;
        await inv.save();

        user.walletBalance += inv.returnAmount;
        await user.save();
      } else if (inv.cycleCompleted && withdrawal?.status === 'pending' && user.walletBalance < inv.returnAmount) {
        user.walletBalance += inv.returnAmount;
        await user.save();
      }
    }

    // 2. Fetch active investment
    const activeInvestment = await Investment.findOne({
      user: user._id,
      status: 'approved',
      cycleCompleted: false
    });

    // 3. Calculate total profit earned
    const completed = await Investment.find({
      user: user._id,
      status: 'approved',
      cycleCompleted: true
    });

    const profitEarned = completed.reduce((sum, inv) => {
      return sum + (inv.returnAmount - inv.amount);
    }, 0);

    // 4. Get latest withdrawal info
    const lastWithdrawal = await Withdrawal.findOne({ user: user._id }).sort({ createdAt: -1 });
    const lastWithdrawalStatus = lastWithdrawal?.status || null;

    // ✅ Fix: Only subtract if latest withdrawal is approved AND it matches the last cycle
    let currentBalance = user.walletBalance;

    if (lastWithdrawal?.status === 'approved') {
      currentBalance = Math.max(user.walletBalance - lastWithdrawal.amount, 0);
    }

    // 5. Final response
    res.json({
      name: user.name,
      email: user.email,
      balance: currentBalance,
      earnings: profitEarned,
      activeInvestment,
      referralCode: user.referralCode,
      bonusEarned: user.bonusEarned,
      cashAppId: user.cashAppId,
      cashAppQr: user.cashAppQr,
      lastWithdrawalStatus
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const withdrawals = await Withdrawal.find({ user: userId });
    const investments = await Investment.find({ user: userId });

    const formatted = [
      ...withdrawals.map(w => ({
        id: `WD-${w._id.toString().slice(-6)}`,
        type: 'withdraw',
        amount: w.amount,
        status: w.status,
        date: new Date(w.createdAt).toISOString().split('T')[0]
      })),
      ...investments.map(i => ({
        id: `INV-${i._id.toString().slice(-6)}`,
        type: 'deposit',
        amount: i.amount,
        status: i.status === 'approved' && i.cycleCompleted ? 'completed' : i.status,
        date: new Date(i.createdAt).toISOString().split('T')[0]
      }))
    ];

    const sorted = formatted.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (err) {
    console.error('Transaction fetch error:', err);
    res.status(500).json({ message: 'Failed to load transactions' });
  }
};
