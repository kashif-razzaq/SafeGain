const Investment = require('../models/Investment');
const Package = require('../models/Package');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

exports.approveInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment || investment.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid or already approved' });
    }

    investment.status = 'approved';
    investment.approvedAt = new Date();
    await investment.save();

    // Auto-create withdrawal (cycle reward)
    const user = await User.findById(investment.user);
    await Withdrawal.create({
      user: investment.user,
      amount: investment.returnAmount,
      status: 'pending',
      cashAppId: user.cashAppId || '',
      cycleId: investment._id
    });

    // ✅ Referral bonus logic
    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        const referralBonus = parseFloat((investment.amount * 0.01).toFixed(2));
        referrer.bonusEarned += referralBonus;
        await referrer.save();
      }
    }

    res.json({ message: 'Investment approved and withdrawal created.' });
  } catch (err) {
    console.error('Approval error:', err.message);
    res.status(500).json({ message: 'Server error during approval' });
  }
};

exports.createInvestment = async (req, res) => {
  const amount = parseFloat(req.body.amount);
  const { packageId } = req.body;
  const userId = req.user._id;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) return res.status(400).json({ message: 'Invalid package' });

    if (amount < pkg.minAmount || amount > pkg.maxAmount) {
      return res.status(400).json({
        message: `Amount must be between ${pkg.minAmount} and ${pkg.maxAmount}`
      });
    }

    const user = await User.findById(userId);
    const bonusPercent = Math.min(user.verifiedReferralsCount, 10); // max +4%
    const totalPercent = Math.min(pkg.baseProfitPercent + bonusPercent, 20); // cap at 10%

    const returnAmount = parseFloat((amount + (amount * totalPercent / 100)).toFixed(2));

    const newInvestment = new Investment({
      user: userId,
      amount,
      returnAmount,
      durationInHours: pkg.durationInHours,
      status: 'pending'
    });

    await newInvestment.save();
    res.status(201).json({ message: 'Investment submitted', investment: newInvestment });
  } catch (err) {
    console.error('Investment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyInvestments = async (req, res) => {
  const userId = req.user._id;
  try {
    const investments = await Investment.find({ user: userId }).sort({ createdAt: -1 });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load investments' });
  }
};
