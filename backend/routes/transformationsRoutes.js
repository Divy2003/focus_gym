// routes/transformationsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getHomeTransformations, upsertHomeTransformations } = require('../controllers/transformationController');

// Public: get the 3 transformations for home page
router.get('/home', getHomeTransformations);

// Protected: upsert the 3 transformations (admin only)
router.post('/home', auth, upsertHomeTransformations);

module.exports = router;
