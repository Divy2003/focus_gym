// routes/analyticsRoutes.js
const express = require('express');
const authMiddleware = require('../middlewares/auth');
const { getDashboardAnalytics, getExpiringMembers } = require('../controllers/analyticsController');

const router = express.Router();

// All routes require admin authentication
router.use(authMiddleware);

router.get('/dashboard', getDashboardAnalytics);
router.get('/expiring-members', getExpiringMembers);

module.exports = router;
