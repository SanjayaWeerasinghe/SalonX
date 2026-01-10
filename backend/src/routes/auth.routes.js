const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private (requires authentication)
 */
router.get('/me', authMiddleware, authController.me);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private (requires authentication)
 */
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
