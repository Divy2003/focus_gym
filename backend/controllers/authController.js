// controllers/authController.js
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const { validationResult } = require('express-validator');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { mobile } = req.body;

    // Check if mobile number is the admin mobile
    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Unauthorized mobile number'
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Update admin with OTP
    admin.otp = {
      code: otp,
      expiresAt
    };
    await admin.save();

    // Send OTP via Twilio
    try {
      await client.messages.create({
        body: `Your GYM Admin login OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: mobile
      });

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      // For development, return OTP in response (remove in production)
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify OTP and login
const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { mobile, otp } = req.body;

    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check OTP validity
    if (!admin.otp.code || admin.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or invalid'
      });
    }

    if (admin.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Clear OTP after successful verification
    admin.otp = undefined;
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, mobile: admin.mobile },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        mobile: admin.mobile
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP
};
