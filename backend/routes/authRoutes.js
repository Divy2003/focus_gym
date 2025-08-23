// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { sendOTP, verifyOTP } = require('../controllers/authController');

const router = express.Router();

// Send OTP
router.post('/send-otp', [
  body('mobile')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10-15 digits')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid mobile number format')
], sendOTP);

// Verify OTP and Login
router.post('/verify-otp', [
  body('mobile')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10-15 digits'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], verifyOTP);

module.exports = router;
