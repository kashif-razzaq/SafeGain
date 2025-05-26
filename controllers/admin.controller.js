// controllers/admin.controller.js
const User = require('../models/User');
const Investment = require('../models/Investment');
const Withdrawal = require('../models/Withdrawal');
const Package = require('../models/Package');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');


exports.getAdminOverview = async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: 'user' });

    const totalDepositsAgg = await Investment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const activeInvestmentsAgg = await Investment.aggregate([
      { $match: { status: 'approved', cycleCompleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    res.status(200).json({
      users: usersCount,
      deposits: totalDepositsAgg[0]?.total || 0,
      investments: activeInvestmentsAgg[0]?.total || 0,
      withdrawals: pendingWithdrawals
    });
  } catch (error) {
    console.error('Admin Overview Error:', error);
    res.status(500).json({ message: 'Failed to fetch overview stats' });
  }
};
// GET /admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// PATCH /admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

// PATCH /admin/users/:id/status
exports.toggleUserStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
// POST /admin/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, status } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name, email, phone,
      password: hashed,
      role: role || 'user',
      status: status || 'active'
    });

    res.status(201).json({ user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// PATCH /admin/users/:id
exports.editUser = async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role, status },
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
};
// GET /admin/investments
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(investments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch investments' });
  }
};

// PATCH /admin/investments/:id/approve
exports.approveInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id).populate('user');
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    if (investment.status === 'approved') return res.status(400).json({ message: 'Already approved' });

    // Mark investment as approved
    investment.status = 'approved';
    investment.approvedAt = new Date();
    await investment.save();

    // Auto-create withdrawal request
    const { amount, returnAmount, user } = investment;
      await Withdrawal.create({
        user: user._id,
        amount,
        profit: returnAmount - amount,
        cashAppId: user.cashAppId || '', // ⬅️ auto-add user's cashAppId
        cycleId: investment._id,         // ⬅️ track original investment
        status: 'pending',
        createdAt: new Date()
      });


    res.status(200).json({ message: 'Investment approved and withdrawal created' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve investment' });
  }
};
// GET /admin/withdrawals
exports.getWithdrawals = async (req, res) => {
  try {
    const data = await Withdrawal.find()
      .populate('user', 'name email cashAppId')
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load withdrawals' });
  }
};

// PATCH /admin/withdrawals/:id/status
exports.updateWithdrawalStatus = async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user');

    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    // On approval: simulate balance update
    if (status === 'approved') {
      const user = await User.findById(withdrawal.user._id);
      user.walletBalance += withdrawal.amount + withdrawal.profit;
      await user.save();
    }

    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// DELETE /admin/withdrawals/:id
exports.deleteWithdrawal = async (req, res) => {
  try {
    const deleted = await Withdrawal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete' });
  }
};
// GET all packages
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.status(200).json(packages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load packages' });
  }
};

// CREATE new package
exports.createPackage = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create package' });
  }
};

// UPDATE package
exports.updatePackage = async (req, res) => {
  try {
    const updated = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update package' });
  }
};

// DELETE package
exports.deletePackage = async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete package' });
  }
};
// POST /admin/notifications/send
// POST /api/admin/notifications/send
exports.sendNotification = async (req, res) => {
  const { message, users, sendEmail: emailEnabled, sendPush, type } = req.body;

  if (!message || !users) {
    return res.status(400).json({ message: 'Message and users are required.' });
  }

  try {
    const userList = users === 'all'
      ? await User.find()
      : await User.find({ _id: { $in: users } });

    for (const user of userList) {
      await Notification.create({
        user: user._id,
        message,
        type: type || 'system'
      });

      if (emailEnabled) {
        await sendEmail(user.email, 'custom', {
          name: user.name,
          message,
          subject: 'Admin Notification – SafeGain'
        });
      }

      if (sendPush) {
        // Add Firebase logic here later
      }
    }

    res.status(200).json({ message: 'Notifications sent successfully.' });
  } catch (err) {
    console.error('❌ sendNotification error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getNotificationHistory = async (req, res) => {
  try {
    const logs = await Notification.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load notification history' });
  }
};