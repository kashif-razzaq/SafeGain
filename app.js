const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const investmentRoutes = require('./routes/investment.routes');
const packageRoutes = require('./routes/package.routes');
const depositRoutes = require('./routes/deposit.routes');
const notificationRoutes = require('./routes/notification.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin');

dotenv.config();
require('dotenv').config();
const app = express();
const allowedOrigins = [  'https://safegain-frontend.vercel.app']; // your frontend URL
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // ✅ This is required for cookies/auth headers
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/investments', investmentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/deposit-methods', depositRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);
app.get('/', (req, res) => res.send('SafeGain API Running'));
app.use('/uploads', express.static('uploads'));
app.use('/api/admin', adminRoutes);

module.exports = app;
