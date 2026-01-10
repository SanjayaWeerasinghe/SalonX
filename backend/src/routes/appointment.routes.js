const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All appointment routes require authentication
router.use(authMiddleware);

// Calendar view route (must be before /:id routes)
router.get('/calendar', appointmentController.getCalendarAppointments);

// Appointment CRUD routes
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

// Appointment actions
router.post('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;
