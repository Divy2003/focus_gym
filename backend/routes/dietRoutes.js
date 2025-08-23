// routes/dietRoutes.js
const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const {
  createDietPlan,
  getDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan
} = require('../controllers/dietController');

const router = express.Router();

// All routes require admin authentication
router.use(authMiddleware);

const dietPlanValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('targetAudience').isIn(['weight_loss', 'weight_gain', 'muscle_building', 'maintenance', 'general'])
    .withMessage('Invalid target audience'),
  body('meals').isArray().withMessage('Meals must be an array'),
  body('meals.*.name').trim().notEmpty().withMessage('Meal name is required'),
  body('meals.*.time').trim().notEmpty().withMessage('Meal time is required'),
  body('meals.*.items').isArray().withMessage('Meal items must be an array')
];

router.post('/', dietPlanValidation, createDietPlan);
router.get('/', getDietPlans);
router.get('/:id', getDietPlan);
router.put('/:id', dietPlanValidation, updateDietPlan);
router.delete('/:id', deleteDietPlan);

module.exports = router;
