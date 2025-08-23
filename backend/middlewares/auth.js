// middleware/auth.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;
