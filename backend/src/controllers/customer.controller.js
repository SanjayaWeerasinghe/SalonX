const Customer = require('../models/schemas/Customer');
const Appointment = require('../models/schemas/Appointment');
const Invoice = require('../models/schemas/Invoice');

const customerController = {
  /**
   * Get all customers with optional search and pagination
   * GET /api/customers
   * Query params: search, page, limit
   */
  async getAllCustomers(req, res, next) {
    try {
      const { search, page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;

      // Build search query
      let query = {};
      if (search) {
        query = {
          $or: [
            { first_name: { $regex: search, $options: 'i' } },
            { last_name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        };
      }

      // Get customers with pagination
      const customers = await Customer.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Customer.countDocuments(query);

      res.json({
        customers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get customer by ID with metrics
   * GET /api/customers/:id
   */
  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;

      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          error: {
            message: 'Customer not found',
            status: 404,
          },
        });
      }

      // Get customer metrics
      const totalAppointments = await Appointment.countDocuments({
        customer_id: id
      });

      const completedAppointments = await Appointment.countDocuments({
        customer_id: id,
        status: 'completed'
      });

      // Calculate total revenue from invoices
      const invoices = await Invoice.find({ customer_id: id });
      const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

      // Get last visit
      const lastAppointment = await Appointment.findOne({
        customer_id: id,
        status: 'completed'
      })
        .sort({ appointment_date: -1 })
        .limit(1);

      res.json({
        customer,
        metrics: {
          totalAppointments,
          completedAppointments,
          totalRevenue,
          lastVisit: lastAppointment ? lastAppointment.appointment_date : null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new customer
   * POST /api/customers
   * Body: { first_name, last_name, email, phone, notes }
   */
  async createCustomer(req, res, next) {
    try {
      const { first_name, last_name, email, phone, notes } = req.body;

      // Validate required fields
      if (!first_name || !last_name) {
        return res.status(400).json({
          error: {
            message: 'First name and last name are required',
            status: 400,
          },
        });
      }

      // Check if customer with same email exists (if email provided)
      if (email) {
        const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
        if (existingCustomer) {
          return res.status(409).json({
            error: {
              message: 'Customer with this email already exists',
              status: 409,
            },
          });
        }
      }

      // Create customer
      const customer = new Customer({
        first_name,
        last_name,
        email: email ? email.toLowerCase() : undefined,
        phone,
        notes,
      });

      await customer.save();

      res.status(201).json({
        message: 'Customer created successfully',
        customer,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update customer
   * PUT /api/customers/:id
   * Body: { first_name, last_name, email, phone, notes }
   */
  async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, phone, notes } = req.body;

      // Check if customer exists
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          error: {
            message: 'Customer not found',
            status: 404,
          },
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email.toLowerCase() !== customer.email) {
        const existingCustomer = await Customer.findOne({
          email: email.toLowerCase(),
          _id: { $ne: id }
        });

        if (existingCustomer) {
          return res.status(409).json({
            error: {
              message: 'Customer with this email already exists',
              status: 409,
            },
          });
        }
      }

      // Update customer
      customer.first_name = first_name || customer.first_name;
      customer.last_name = last_name || customer.last_name;
      customer.email = email ? email.toLowerCase() : customer.email;
      customer.phone = phone !== undefined ? phone : customer.phone;
      customer.notes = notes !== undefined ? notes : customer.notes;

      await customer.save();

      res.json({
        message: 'Customer updated successfully',
        customer,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete customer
   * DELETE /api/customers/:id
   */
  async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;

      // Check if customer exists
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          error: {
            message: 'Customer not found',
            status: 404,
          },
        });
      }

      // Check if customer has appointments
      const hasAppointments = await Appointment.exists({ customer_id: id });

      if (hasAppointments) {
        return res.status(400).json({
          error: {
            message: 'Cannot delete customer with existing appointments',
            status: 400,
          },
        });
      }

      // Delete customer
      await Customer.findByIdAndDelete(id);

      res.json({
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get customer appointments
   * GET /api/customers/:id/appointments
   */
  async getCustomerAppointments(req, res, next) {
    try {
      const { id } = req.params;
      const { status, limit = 10 } = req.query;

      // Check if customer exists
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          error: {
            message: 'Customer not found',
            status: 404,
          },
        });
      }

      // Build query
      let query = { customer_id: id };
      if (status) {
        query.status = status;
      }

      // Get appointments
      const appointments = await Appointment.find(query)
        .populate('services.service_id', 'name price')
        .sort({ appointment_date: -1 })
        .limit(parseInt(limit));

      res.json({
        appointments,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get customer invoices
   * GET /api/customers/:id/invoices
   */
  async getCustomerInvoices(req, res, next) {
    try {
      const { id } = req.params;
      const { payment_status, limit = 10 } = req.query;

      // Check if customer exists
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          error: {
            message: 'Customer not found',
            status: 404,
          },
        });
      }

      // Build query
      let query = { customer_id: id };
      if (payment_status) {
        query.payment_status = payment_status;
      }

      // Get invoices
      const invoices = await Invoice.find(query)
        .sort({ issue_date: -1 })
        .limit(parseInt(limit));

      res.json({
        invoices,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = customerController;
