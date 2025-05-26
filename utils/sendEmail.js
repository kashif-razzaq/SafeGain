const nodemailer = require('nodemailer');
const { generateEmail } = require('./emailTemplates');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey', // DO NOT CHANGE THIS
    pass: process.env.SENDGRID_API_KEY
  }
});

async function sendEmail(to, type, data) {
  const { subject, html } = generateEmail(type, data);

  console.log('➡️ Email Subject:', subject);
  console.log('➡️ Email HTML:', html);

  const mailOptions = {
    from: `"SafeGain" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}:`, info.response);
  } catch (err) {
    console.error('❌ Email sending error:', err);
  }
}

module.exports = { sendEmail };
