const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey', // ⚠️ this must literally be 'apikey'
    pass: process.env.SENDGRID_API_KEY
  }
});

module.exports = transporter;
