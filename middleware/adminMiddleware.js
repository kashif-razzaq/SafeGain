// middleware/authMiddleware.js
module.exports = (req, res, next) => {
  // TEMP: Mock user for development
  req.user = { id: 'admin123', role: 'admin' }; // Simulate logged-in admin
  next();
};
