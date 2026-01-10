const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All dashboard routes require authentication
router.use(authMiddleware);

// Dashboard statistics endpoints
router.get('/overview', dashboardController.getOverview);
router.get('/revenue-chart', dashboardController.getRevenueChart);
router.get('/appointment-stats', dashboardController.getAppointmentStats);
router.get('/top-customers', dashboardController.getTopCustomers);
router.get('/popular-services', dashboardController.getPopularServices);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
