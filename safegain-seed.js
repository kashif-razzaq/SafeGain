// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Replace with your DB
const MONGO_URI = 'mongodb://mongo:WbSEheftNfecPdLXjmrVREKUbYzlYXTX@trolley.proxy.rlwy.net:32041';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  referralCode: String,
  verifiedReferralsCount: Number,
  walletBalance: Number,
  cashAppId: String,
  role: String
});

const packageSchema = new mongoose.Schema({
  title: String,
  minAmount: Number,
  maxAmount: Number,
  baseProfitPercent: Number,
  durationInHours: Number
});

const investmentSchema = new mongoose.Schema({
  user: mongoose.Types.ObjectId,
  amount: Number,
  packageId: mongoose.Types.ObjectId,
  returnAmount: Number,
  status: String,
  createdAt: Date
});

const withdrawalSchema = new mongoose.Schema({
  user: mongoose.Types.ObjectId,
  amount: Number,
  cashAppId: String,
  status: String,
  createdAt: Date
});

const depositSchema = new mongoose.Schema({
  user: mongoose.Types.ObjectId,
  amount: Number,
  cryptoType: String,
  status: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);
const Package = mongoose.model('Package', packageSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
const Deposit = mongoose.model('Deposit', depositSchema);

async function seed() {
  await mongoose.connection.dropDatabase();

  const hashedPassword = await bcrypt.hash('test1234', 10);

  const user = await User.create({
    name: 'John Doe',
    email: 'john@safegain.com',
    phone: '+15551234567',
    password: hashedPassword,
    referralCode: 'SG1234',
    verifiedReferralsCount: 2,
    walletBalance: 500,
    cashAppId: '$johnDoe',
    role: 'user'
  });

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@safegain.com',
    phone: '+15550001111',
    password: hashedPassword,
    referralCode: null,
    verifiedReferralsCount: 0,
    walletBalance: 0,
    cashAppId: null,
    role: 'admin'
  });

  const pkg = await Package.create({
    title: 'Basic Plan',
    minAmount: 100,
    maxAmount: 1000,
    baseProfitPercent: 8,
    durationInHours: 6
  });

  const investment = await Investment.create({
    user: user._id,
    amount: 200,
    packageId: pkg._id,
    returnAmount: 216,
    status: 'approved',
    createdAt: new Date()
  });

  await Withdrawal.create({
    user: user._id,
    amount: 216,
    cashAppId: user.cashAppId,
    status: 'pending',
    createdAt: new Date()
  });

  await Deposit.create({
    user: user._id,
    amount: 200,
    cryptoType: 'USDT',
    status: 'approved',
    createdAt: new Date()
  });

  console.log('✅ SafeGain seed data inserted.');
  process.exit();
}

seed();
