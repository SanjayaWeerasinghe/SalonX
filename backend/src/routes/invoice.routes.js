const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All invoice routes require authentication
router.use(authMiddleware);

// Create invoice from appointment (must be before /:id routes)
router.post('/from-appointment/:appointment_id', invoiceController.createInvoiceFromAppointment);

// Invoice CRUD routes
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

// Payment recording
router.post('/:id/payment', invoiceController.recordPayment);

module.exports = router;
