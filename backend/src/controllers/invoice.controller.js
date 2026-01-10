const Invoice = require('../models/schemas/Invoice');
const Customer = require('../models/schemas/Customer');
const Appointment = require('../models/schemas/Appointment');
const Service = require('../models/schemas/Service');

const invoiceController = {
  /**
   * Get all invoices with filters
   * GET /api/invoices
   * Query params: customer_id, payment_status, date_from, date_to, page, limit
   */
  async getAllInvoices(req, res, next) {
    try {
      const {
        customer_id,
        payment_status,
        date_from,
        date_to,
        page = 1,
        limit = 50
      } = req.query;

      const skip = (page - 1) * limit;

      // Build query
      let query = {};

      if (customer_id) {
        query.customer_id = customer_id;
      }

      if (payment_status) {
        query.payment_status = payment_status;
      }

      if (date_from || date_to) {
        query.issue_date = {};
        if (date_from) {
          query.issue_date.$gte = new Date(date_from);
        }
        if (date_to) {
          query.issue_date.$lte = new Date(date_to);
        }
      }

      // Get invoices
      const invoices = await Invoice.find(query)
        .populate('customer_id', 'first_name last_name email phone')
        .populate('appointment_id')
        .sort({ issue_date: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Invoice.countDocuments(query);

      res.json({
        invoices,
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
   * Get invoice by ID
   * GET /api/invoices/:id
   */
  async getInvoiceById(req, res, next) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findById(id)
        .populate('customer_id', 'first_name last_name email phone')
        .populate('appointment_id')
        .populate('line_items.service_id', 'name');

      if (!invoice) {
        return res.status(404).json({
          error: {
            message: 'Invoice not found',
            status: 404,
          },
        });
      }

      res.json({
        invoice,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get next invoice number
   */
  async getNextInvoiceNumber() {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;

    // Find the latest invoice for this year
    const latestInvoice = await Invoice.findOne({
      invoice_number: { $regex: `^${prefix}` }
    }).sort({ invoice_number: -1 });

    if (!latestInvoice) {
      return `${prefix}0001`;
    }

    // Extract the number and increment
    const lastNumber = parseInt(latestInvoice.invoice_number.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');

    return `${prefix}${nextNumber}`;
  },

  /**
   * Create new invoice
   * POST /api/invoices
   * Body: { customer_id, appointment_id, line_items: [{service_id, description, quantity, unit_price}], tax, notes }
   */
  async createInvoice(req, res, next) {
    try {
      const {
        customer_id,
        appointment_id,
        line_items,
        tax = 0,
        due_date,
        notes
      } = req.body;

      // Validate required fields
      if (!customer_id) {
        return res.status(400).json({
          error: {
            message: 'Customer ID is required',
            status: 400,
          },
        });
      }

      if (!line_items || line_items.length === 0) {
        return res.status(400).json({
          error: {
            message: 'At least one line item is required',
            status: 400,
          },
        });
      }

      // Verify customer exists
      const customer = await Customer.findById(customer_id);
      if (!customer) {
        return res.status(404).json({
          error: {
            message: 'Customer not found',
            status: 404,
          },
        });
      }

      // Verify appointment exists if provided
      if (appointment_id) {
        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) {
          return res.status(404).json({
            error: {
              message: 'Appointment not found',
              status: 404,
            },
          });
        }
      }

      // Process line items and calculate totals
      const processedLineItems = [];
      let subtotal = 0;

      for (const item of line_items) {
        if (!item.description || item.unit_price === undefined) {
          return res.status(400).json({
            error: {
              message: 'Each line item must have description and unit_price',
              status: 400,
            },
          });
        }

        const quantity = item.quantity || 1;
        const unit_price = parseFloat(item.unit_price);
        const total_price = quantity * unit_price;

        processedLineItems.push({
          service_id: item.service_id || undefined,
          description: item.description,
          quantity,
          unit_price,
          total_price,
        });

        subtotal += total_price;
      }

      const taxAmount = parseFloat(tax) || 0;
      const total = subtotal + taxAmount;

      // Generate invoice number
      const invoice_number = await invoiceController.getNextInvoiceNumber();

      // Create invoice
      const invoice = new Invoice({
        invoice_number,
        customer_id,
        appointment_id: appointment_id || undefined,
        issue_date: new Date(),
        due_date: due_date ? new Date(due_date) : undefined,
        line_items: processedLineItems,
        subtotal,
        tax: taxAmount,
        total,
        payment_status: 'unpaid',
        paid_amount: 0,
        notes,
      });

      await invoice.save();

      // Populate the invoice for response
      await invoice.populate([
        { path: 'customer_id', select: 'first_name last_name email phone' },
        { path: 'appointment_id' },
        { path: 'line_items.service_id', select: 'name' }
      ]);

      res.status(201).json({
        message: 'Invoice created successfully',
        invoice,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create invoice from appointment
   * POST /api/invoices/from-appointment/:appointment_id
   */
  async createInvoiceFromAppointment(req, res, next) {
    try {
      const { appointment_id } = req.params;
      const { tax = 0, due_date, notes } = req.body;

      // Get appointment with populated services
      const appointment = await Appointment.findById(appointment_id)
        .populate('services.service_id');

      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found',
            status: 404,
          },
        });
      }

      // Check if invoice already exists for this appointment
      const existingInvoice = await Invoice.findOne({ appointment_id });
      if (existingInvoice) {
        return res.status(409).json({
          error: {
            message: 'Invoice already exists for this appointment',
            status: 409,
            invoice_id: existingInvoice._id,
          },
        });
      }

      // Build line items from appointment services
      const line_items = appointment.services.map(s => ({
        service_id: s.service_id._id,
        description: s.service_id.name,
        quantity: s.quantity,
        unit_price: s.price_at_time,
        total_price: s.quantity * s.price_at_time,
      }));

      const subtotal = line_items.reduce((sum, item) => sum + item.total_price, 0);
      const taxAmount = parseFloat(tax) || 0;
      const total = subtotal + taxAmount;

      // Generate invoice number
      const invoice_number = await invoiceController.getNextInvoiceNumber();

      // Create invoice
      const invoice = new Invoice({
        invoice_number,
        customer_id: appointment.customer_id,
        appointment_id,
        issue_date: new Date(),
        due_date: due_date ? new Date(due_date) : undefined,
        line_items,
        subtotal,
        tax: taxAmount,
        total,
        payment_status: 'unpaid',
        paid_amount: 0,
        notes,
      });

      await invoice.save();

      // Populate the invoice for response
      await invoice.populate([
        { path: 'customer_id', select: 'first_name last_name email phone' },
        { path: 'appointment_id' },
        { path: 'line_items.service_id', select: 'name' }
      ]);

      res.status(201).json({
        message: 'Invoice created from appointment successfully',
        invoice,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update invoice
   * PUT /api/invoices/:id
   */
  async updateInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const { line_items, tax, due_date, notes } = req.body;

      const invoice = await Invoice.findById(id);

      if (!invoice) {
        return res.status(404).json({
          error: {
            message: 'Invoice not found',
            status: 404,
          },
        });
      }

      // Don't allow updating paid invoices
      if (invoice.payment_status === 'paid') {
        return res.status(400).json({
          error: {
            message: 'Cannot update a paid invoice',
            status: 400,
          },
        });
      }

      // Update line items if provided
      if (line_items && line_items.length > 0) {
        const processedLineItems = [];
        let subtotal = 0;

        for (const item of line_items) {
          const quantity = item.quantity || 1;
          const unit_price = parseFloat(item.unit_price);
          const total_price = quantity * unit_price;

          processedLineItems.push({
            service_id: item.service_id || undefined,
            description: item.description,
            quantity,
            unit_price,
            total_price,
          });

          subtotal += total_price;
        }

        invoice.line_items = processedLineItems;
        invoice.subtotal = subtotal;
      }

      // Update tax
      if (tax !== undefined) {
        invoice.tax = parseFloat(tax);
      }

      // Recalculate total
      invoice.total = invoice.subtotal + invoice.tax;

      // Update due date
      if (due_date !== undefined) {
        invoice.due_date = due_date ? new Date(due_date) : undefined;
      }

      // Update notes
      if (notes !== undefined) {
        invoice.notes = notes;
      }

      await invoice.save();

      // Populate for response
      await invoice.populate([
        { path: 'customer_id', select: 'first_name last_name email phone' },
        { path: 'appointment_id' },
        { path: 'line_items.service_id', select: 'name' }
      ]);

      res.json({
        message: 'Invoice updated successfully',
        invoice,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Record payment
   * POST /api/invoices/:id/payment
   * Body: { amount }
   */
  async recordPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: {
            message: 'Valid payment amount is required',
            status: 400,
          },
        });
      }

      const invoice = await Invoice.findById(id);

      if (!invoice) {
        return res.status(404).json({
          error: {
            message: 'Invoice not found',
            status: 404,
          },
        });
      }

      const paymentAmount = parseFloat(amount);
      const newPaidAmount = invoice.paid_amount + paymentAmount;

      if (newPaidAmount > invoice.total) {
        return res.status(400).json({
          error: {
            message: 'Payment amount exceeds invoice total',
            status: 400,
          },
        });
      }

      invoice.paid_amount = newPaidAmount;

      if (newPaidAmount >= invoice.total) {
        invoice.payment_status = 'paid';
        invoice.payment_date = new Date();
      } else if (newPaidAmount > 0) {
        invoice.payment_status = 'partially_paid';
      }

      await invoice.save();

      // Populate for response
      await invoice.populate([
        { path: 'customer_id', select: 'first_name last_name email phone' },
        { path: 'appointment_id' },
        { path: 'line_items.service_id', select: 'name' }
      ]);

      res.json({
        message: 'Payment recorded successfully',
        invoice,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete invoice
   * DELETE /api/invoices/:id
   */
  async deleteInvoice(req, res, next) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findById(id);

      if (!invoice) {
        return res.status(404).json({
          error: {
            message: 'Invoice not found',
            status: 404,
          },
        });
      }

      // Don't allow deleting paid invoices
      if (invoice.payment_status === 'paid') {
        return res.status(400).json({
          error: {
            message: 'Cannot delete a paid invoice',
            status: 400,
          },
        });
      }

      await Invoice.findByIdAndDelete(id);

      res.json({
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = invoiceController;
