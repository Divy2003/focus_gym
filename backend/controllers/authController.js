const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Generate JWT Token
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, mobile: admin.mobile },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '24h' }
  );
};

// Login with mobile and password
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { mobile, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ mobile }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin);

    // Omit password from response
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: adminData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.id).select('+password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
};

module.exports = {
  login,
  changePassword,
  getMe,
};