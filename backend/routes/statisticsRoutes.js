const express = require('express');
const { getPlatformStats, getUserDashboardStats } = require('../controllers/statisticsController');
const { protect } = require('../middleware/authMiddleware');
const { rateLimiters } = require('../middleware/rateLimiters');

const router = express.Router();

// Public route for platform statistics (used on landing page)
router.get('/platform', rateLimiters.general, getPlatformStats);

// Protected route for user dashboard statistics
router.get('/dashboard', protect, rateLimiters.general, getUserDashboardStats);

module.exports = router;