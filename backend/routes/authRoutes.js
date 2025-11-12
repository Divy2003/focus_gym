// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { login, changePassword, getMe } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Login with email and password
router.post('/login', [
  body('mobile')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10-15 digits')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid mobile number format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], login);

// Change password (protected route)
router.post('/change-password', [
  authMiddleware,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], changePassword);

// Get current user (protected route)
router.get('/me', authMiddleware, getMe);

module.exports = router;
