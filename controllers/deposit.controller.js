const DepositMethod = require('../models/DepositMethod');

exports.getActiveDepositMethods = async (req, res) => {
  try {
    const methods = await DepositMethod.find({ status: 'active' });
    res.json(methods);
  } catch (err) {
    console.error('Deposit methods error:', err);
    res.status(500).json({ message: 'Failed to load deposit methods' });
  }
};
