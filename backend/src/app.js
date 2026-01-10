const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Salon Management API is running' });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

module.exports = app;
