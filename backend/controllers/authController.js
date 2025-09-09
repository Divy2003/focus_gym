const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { sendOTPViaMSG91, sendOTPViaSMS } = require("../utils/msg91Otp");

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { mobile } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized mobile number",
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid 10 mins

    // Save OTP in DB
    admin.otp = {
      code: otp,
      expiresAt,
    };
    await admin.save();

    // --- Send OTP using MSG91 ---
    const cleanMobile = mobile.replace(/\D/g, '');
    
    try {
      // Try Flow API first
      await sendOTPViaMSG91(cleanMobile, otp);
      console.log(`OTP sent via Flow API to ${mobile}: ${otp}`);
    } catch (flowError) {
      console.log('Flow API failed, trying SMS API:', flowError.message);
      
      try {
        // Fallback to SMS API
        await sendOTPViaSMS(cleanMobile, otp);
        console.log(`OTP sent via SMS API to ${mobile}: ${otp}`);
      } catch (smsError) {
        console.error('Both MSG91 methods failed:', smsError.message);
        // Don't fail the request - OTP is logged for development
        console.log(`FALLBACK - OTP for ${mobile}: ${otp} (valid till ${expiresAt})`);
      }
    }

    // Also log OTP in console (useful in dev/testing)
    console.log(`OTP for ${mobile}: ${otp} (valid till ${expiresAt})`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      //otp: process.env.NODE_ENV === "development" ? otp : undefined,
      // Include OTP in response so client can display it on the verify page when needed
      otp,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// Verify OTP + Login (unchanged)
const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { mobile, otp } = req.body;

    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Validate OTP
    if (!admin.otp?.code || admin.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or invalid",
      });
    }

    if (admin.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP verified -> clear it
    admin.otp = undefined;
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, mobile: admin.mobile },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        mobile: admin.mobile,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};