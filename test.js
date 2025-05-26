const mongoose = require('mongoose');
const Investment = require('./models/Investment');
const Withdrawal = require('./models/Withdrawal');
const User = require('./models/User'); // Needed to get CashApp ID

const MONGO_URI = 'mongodb://mongo:WbSEheftNfecPdLXjmrVREKUbYzlYXTX@trolley.proxy.rlwy.net:32041';
const INVESTMENT_ID = '68341f82d952d7f1a40ccf77'; // Replace with real ID

const approveAndCreateWithdrawal = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    const investment = await Investment.findById(INVESTMENT_ID);
    if (!investment) throw new Error('Investment not found');
    if (investment.status === 'approved') {
      console.log('✅ Investment already approved');
    } else {
      investment.status = 'approved';
      investment.approvedAt = new Date();
      await investment.save();
      console.log('✅ Investment Approved:', investment._id);
    }

    const user = await User.findById(investment.user);
    if (!user) throw new Error('User not found');

    const existingWithdrawal = await Withdrawal.findOne({
      cycleId: investment._id,
      user: user._id
    });

    if (existingWithdrawal) {
      console.log('ℹ️ Withdrawal already exists for this investment');
    } else {
      const newWithdrawal = await Withdrawal.create({
        user: user._id,
        amount: investment.returnAmount,
        status: 'pending',
        cashAppId: user.cashAppId || 'unknown',
        cycleId: investment._id
      });
      console.log('✅ Withdrawal created:', newWithdrawal._id);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

approveAndCreateWithdrawal();
