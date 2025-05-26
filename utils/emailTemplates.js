function generateEmail(type, data) {
  if (type === 'resetPassword') {
    return {
      subject: 'Reset Your SafeGain Password',
      html: `
        <div style="font-family:sans-serif; padding: 20px; background:#f9f9f9;">
          <h2 style="color:#006341;">Hello ${data.name},</h2>
          <p>You requested to reset your password.</p>
          <p>
            <a href="${data.link}" style="display:inline-block;background:#006341;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
              Reset Password
            </a>
          </p>
          <p>This link is valid for 1 hour.</p>
        </div>
      `
    };
  }

  if (type === 'welcome') {
    return {
      subject: 'Welcome to SafeGain!',
      html: `
        <div style="font-family:sans-serif; padding: 20px; background:#f9f9f9;">
          <h2 style="color:#006341;">Welcome, ${data.name} 🎉</h2>
          <p>Thank you for joining <strong>SafeGain</strong>. Your financial journey starts now.</p>
          <p style="margin-top:10px;">Start investing and earn up to <strong>10% in just 6 hours</strong> with our trusted platform.</p>
          <p style="color:#888;font-size:13px;margin-top:30px;">Need help? Contact us at support@safegain.com</p>
        </div>
      `
    };
  }

  if (type === 'withdrawalApproved') {
    return {
      subject: 'Your Withdrawal Has Been Approved',
      html: `
        <div style="font-family:sans-serif; padding: 20px; background:#f9f9f9;">
          <h2 style="color:#006341;">Good news, ${data.name}!</h2>
          <p>Your withdrawal of <strong>$${data.amount}</strong> to your CashApp ID <strong>${data.cashAppId}</strong> has been approved.</p>
          <p>You should see the funds shortly. Thank you for using SafeGain.</p>
        </div>
      `
    };
  }

  if (type === 'depositApproved') {
    return {
      subject: 'Your Deposit Has Been Approved',
      html: `
        <div style="font-family:sans-serif; padding: 20px; background:#f9f9f9;">
          <h2 style="color:#006341;">Deposit Confirmed</h2>
          <p>Hi ${data.name},</p>
          <p>Your deposit of <strong>$${data.amount}</strong> has been approved and added to your wallet.</p>
          <p>You can now start investing using your available balance.</p>
        </div>
      `
    };
  }

  if (type === 'otp') {
    return {
      subject: 'Your OTP Code – SafeGain',
      html: `
        <div style="font-family:sans-serif; padding: 20px; background:#f9f9f9;">
          <h2 style="color:#006341;">Verification Code</h2>
          <p>Your OTP code is:</p>
          <p style="font-size:24px; font-weight:bold;">${data.code}</p>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `
    };
  }

  if (type === 'custom') {
    return {
      subject: data.subject || 'SafeGain Notification',
      html: `
        <div style="font-family:sans-serif; padding: 20px; background:#f9f9f9;">
          <h2 style="color:#006341;">Hello ${data.name},</h2>
          <p>${data.message}</p>
        </div>
      `
    };
  }

  return {
    subject: 'SafeGain Notification',
    html: '<p>No email content generated.</p>'
  };
}

module.exports = { generateEmail };
