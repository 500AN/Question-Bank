const express = require('express');
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

module.exports = router;