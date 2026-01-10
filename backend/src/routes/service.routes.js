const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All service routes require authentication
router.use(authMiddleware);

// Service CRUD routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

// Service activation
router.post('/:id/activate', serviceController.activateService);

module.exports = router;
