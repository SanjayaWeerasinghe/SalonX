const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All customer routes require authentication
router.use(authMiddleware);

// Customer CRUD routes
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

// Customer related data
router.get('/:id/appointments', customerController.getCustomerAppointments);
router.get('/:id/invoices', customerController.getCustomerInvoices);

module.exports = router;
