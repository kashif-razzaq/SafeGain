
const Package = require('../models/Package');

exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    console.error('Get packages error:', err);
    res.status(500).json({ message: 'Failed to load packages' });
  }
};
