const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All staff routes require authentication
router.use(authMiddleware);

// Staff CRUD routes
router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

// Toggle active status
router.patch('/:id/toggle-active', staffController.toggleActive);

module.exports = router;
