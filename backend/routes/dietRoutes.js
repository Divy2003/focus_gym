// routes/dietRoutes.js
const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth');
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
  body('title').optional().trim().default('Untitled Diet Plan'),
  body('targetAudience')
    .optional()
    .isIn(['weight_loss', 'weight_gain', 'muscle_building', 'maintenance', 'general'])
    .withMessage('Invalid target audience')
    .default('general'),
  body('meals')
    .optional()
    .isArray()
    .withMessage('Meals must be an array')
    .default([]),
  body('meals.*.name')
    .optional()
    .trim()
    .default('Meal'),
  body('meals.*.time')
    .optional()
    .trim()
    .default(''),
  body('meals.*.items')
    .optional()
    .isArray()
    .withMessage('Meal items must be an array')
    .default([]),
  body('meals.*.items.*.food')
    .optional()
    .trim()
    .default('Food item'),
  body('meals.*.items.*.quantity')
    .optional()
    .trim()
    .default(''),
  body('meals.*.items.*.calories')
    .optional()
    .isNumeric()
    .withMessage('Calories must be a number')
    .default(0),
  body('meals.*.items.*.protein')
    .optional()
    .isNumeric()
    .withMessage('Protein must be a number')
    .default(0),
  body('meals.*.items.*.ingredients')
    .optional()
    .trim()
    .default(''),
  body('meals.*.instructions')
    .optional()
    .trim()
    .default('')
];

// Diet plan CRUD routes
router.post('/', dietPlanValidation, createDietPlan);
router.get('/', getDietPlans);
router.get('/:id', getDietPlan);
router.put('/:id', dietPlanValidation, updateDietPlan);
router.delete('/:id', deleteDietPlan);

module.exports = router;