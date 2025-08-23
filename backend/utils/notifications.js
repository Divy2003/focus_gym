// utils/notifications.js
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email notification
const sendEmailNotification = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error: error.message };
  }
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Calculate membership status
const getMembershipStatus = (endingDate) => {
  const today = new Date();
  const ending = new Date(endingDate);
  
  if (ending < today) {
    return 'expired';
  }
  
  const daysLeft = Math.ceil((ending - today) / (1000 * 60 * 60 * 24));
  
  if (daysLeft <= 7) {
    return 'expiring_soon';
  }
  
  return 'active';
};

module.exports = {
  sendEmailNotification,
  formatCurrency,
  getMembershipStatus
};
