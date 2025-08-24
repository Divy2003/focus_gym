// routes/memberRoutes.js
const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth');
const {
  addMember,
  getMembers,
  updateMember,
  deleteMember,
  bulkDeleteMembers,
  sendMessage
} = require('../controllers/memberController');

const router = express.Router();

const memberValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('mobile').matches(/^\+?[1-9]\d{9,14}$/).withMessage('Invalid mobile number'),
  body('month').isInt({ min: 1 }).withMessage('Month must be a positive integer'),
  body('fees').optional().isFloat({ min: 0 }).withMessage('Fees must be a positive number')
];
// For updating a member (all fields optional)
const updateMemberValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('mobile').optional().matches(/^\+?[1-9]\d{9,14}$/).withMessage('Invalid mobile number'),
  body('month').optional().isInt({ min: 1 }).withMessage('Month must be a positive integer'),
  body('fees').optional().isFloat({ min: 0 }).withMessage('Fees must be a positive number'),
  body('status').optional().isIn(['pending', 'approved', 'expired']).withMessage('Invalid status value')
];

// Public route - Add member (no authentication required)
router.post('/', memberValidation, addMember);

// Protected routes (require admin authentication)
router.use(authMiddleware);

router.get('/', getMembers);
router.put('/:id', updateMemberValidation, updateMember);
router.delete('/:id', deleteMember);
router.post('/bulk-delete', [
  body('memberIds').isArray().withMessage('Member IDs must be an array')
], bulkDeleteMembers);
router.post('/send-message', [
  body('memberIds').isArray().withMessage('Member IDs must be an array'),
  body('message').trim().notEmpty().withMessage('Message is required')
], sendMessage);

module.exports = router;