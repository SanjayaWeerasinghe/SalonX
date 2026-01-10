const Appointment = require('../models/schemas/Appointment');
const Customer = require('../models/schemas/Customer');
const Service = require('../models/schemas/Service');
const emailService = require('../services/email.service');

const appointmentController = {
  /**
   * Get all appointments with filters
   * GET /api/appointments
   * Query params: status, customer_id, date_from, date_to, page, limit
   */
  async getAllAppointments(req, res, next) {
    try {
      const {
        status,
        customer_id,
        date_from,
        date_to,
        page = 1,
        limit = 50
      } = req.query;

      const skip = (page - 1) * limit;

      // Build query
      let query = {};

      if (status) {
        query.status = status;
      }

      if (customer_id) {
        query.customer_id = customer_id;
      }

      if (date_from || date_to) {
        query.appointment_date = {};
        if (date_from) {
          query.appointment_date.$gte = new Date(date_from);
        }
        if (date_to) {
          query.appointment_date.$lte = new Date(date_to);
        }
      }

      // Get appointments
      const appointments = await Appointment.find(query)
        .populate('customer_id', 'first_name last_name email phone')
        .populate('services.service_id', 'name price duration_minutes')
        .populate('created_by', 'first_name last_name email')
        .sort({ appointment_date: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Appointment.countDocuments(query);

      res.json({
        appointments,
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
   * Get appointment by ID
   * GET /api/appointments/:id
   */
  async getAppointmentById(req, res, next) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id)
        .populate('customer_id', 'first_name last_name email phone')
        .populate('services.service_id', 'name price duration_minutes')
        .populate('created_by', 'first_name last_name email');

      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found',
            status: 404,
          },
        });
      }

      res.json({
        appointment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new appointment
   * POST /api/appointments
   * Body: { customer_id, appointment_date, services: [{service_id, quantity}], notes, send_email }
   */
  async createAppointment(req, res, next) {
    try {
      const {
        customer_id,
        appointment_date,
        services,
        notes,
        send_email = true
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

      if (!appointment_date) {
        return res.status(400).json({
          error: {
            message: 'Appointment date is required',
            status: 400,
          },
        });
      }

      if (!services || services.length === 0) {
        return res.status(400).json({
          error: {
            message: 'At least one service is required',
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

      // Process services and calculate total duration
      let totalDuration = 0;
      const processedServices = [];

      for (const serviceItem of services) {
        const service = await Service.findById(serviceItem.service_id);

        if (!service) {
          return res.status(404).json({
            error: {
              message: `Service with ID ${serviceItem.service_id} not found`,
              status: 404,
            },
          });
        }

        if (!service.is_active) {
          return res.status(400).json({
            error: {
              message: `Service "${service.name}" is not active`,
              status: 400,
            },
          });
        }

        processedServices.push({
          service_id: service._id,
          quantity: serviceItem.quantity || 1,
          price_at_time: service.price,
        });

        totalDuration += (service.duration_minutes || 0) * (serviceItem.quantity || 1);
      }

      // Create appointment
      const appointment = new Appointment({
        customer_id,
        appointment_date: new Date(appointment_date),
        duration_minutes: totalDuration,
        services: processedServices,
        notes,
        created_by: req.user.userId,
        status: 'scheduled',
      });

      await appointment.save();

      // Populate the appointment for response
      await appointment.populate([
        { path: 'customer_id', select: 'first_name last_name email phone' },
        { path: 'services.service_id', select: 'name price duration_minutes' },
        { path: 'created_by', select: 'first_name last_name email' }
      ]);

      // Send email confirmation if customer has email and send_email is true
      if (send_email && customer.email) {
        try {
          await emailService.sendAppointmentConfirmation(appointment);
        } catch (emailError) {
          console.error('Failed to send appointment confirmation email:', emailError);
          // Don't fail the request if email fails
        }
      }

      res.status(201).json({
        message: 'Appointment created successfully',
        appointment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update appointment
   * PUT /api/appointments/:id
   * Body: { appointment_date, services, status, notes, send_email }
   */
  async updateAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const {
        appointment_date,
        services,
        status,
        notes,
        send_email = false
      } = req.body;

      // Check if appointment exists
      const appointment = await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found',
            status: 404,
          },
        });
      }

      // Update appointment date
      if (appointment_date) {
        appointment.appointment_date = new Date(appointment_date);
      }

      // Update services if provided
      if (services && services.length > 0) {
        let totalDuration = 0;
        const processedServices = [];

        for (const serviceItem of services) {
          const service = await Service.findById(serviceItem.service_id);

          if (!service) {
            return res.status(404).json({
              error: {
                message: `Service with ID ${serviceItem.service_id} not found`,
                status: 404,
              },
            });
          }

          processedServices.push({
            service_id: service._id,
            quantity: serviceItem.quantity || 1,
            price_at_time: service.price,
          });

          totalDuration += (service.duration_minutes || 0) * (serviceItem.quantity || 1);
        }

        appointment.services = processedServices;
        appointment.duration_minutes = totalDuration;
      }

      // Update status
      if (status) {
        const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            error: {
              message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
              status: 400,
            },
          });
        }
        appointment.status = status;
      }

      // Update notes
      if (notes !== undefined) {
        appointment.notes = notes;
      }

      await appointment.save();

      // Populate the appointment for response
      await appointment.populate([
        { path: 'customer_id', select: 'first_name last_name email phone' },
        { path: 'services.service_id', select: 'name price duration_minutes' },
        { path: 'created_by', select: 'first_name last_name email' }
      ]);

      // Send email notification if requested
      if (send_email && appointment.customer_id.email) {
        try {
          await emailService.sendAppointmentUpdate(appointment);
        } catch (emailError) {
          console.error('Failed to send appointment update email:', emailError);
        }
      }

      res.json({
        message: 'Appointment updated successfully',
        appointment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel appointment
   * POST /api/appointments/:id/cancel
   * Body: { send_email }
   */
  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { send_email = true } = req.body;

      const appointment = await Appointment.findById(id)
        .populate('customer_id', 'first_name last_name email phone');

      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found',
            status: 404,
          },
        });
      }

      if (appointment.status === 'cancelled') {
        return res.status(400).json({
          error: {
            message: 'Appointment is already cancelled',
            status: 400,
          },
        });
      }

      appointment.status = 'cancelled';
      await appointment.save();

      // Populate for full response
      await appointment.populate([
        { path: 'services.service_id', select: 'name price duration_minutes' },
        { path: 'created_by', select: 'first_name last_name email' }
      ]);

      // Send cancellation email
      if (send_email && appointment.customer_id.email) {
        try {
          await emailService.sendAppointmentCancellation(appointment);
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError);
        }
      }

      res.json({
        message: 'Appointment cancelled successfully',
        appointment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete appointment
   * DELETE /api/appointments/:id
   */
  async deleteAppointment(req, res, next) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found',
            status: 404,
          },
        });
      }

      await Appointment.findByIdAndDelete(id);

      res.json({
        message: 'Appointment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get appointments for a specific date range (calendar view)
   * GET /api/appointments/calendar
   * Query params: start_date, end_date
   */
  async getCalendarAppointments(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          error: {
            message: 'start_date and end_date are required',
            status: 400,
          },
        });
      }

      const appointments = await Appointment.find({
        appointment_date: {
          $gte: new Date(start_date),
          $lte: new Date(end_date),
        },
      })
        .populate('customer_id', 'first_name last_name email phone')
        .populate('services.service_id', 'name price duration_minutes')
        .sort({ appointment_date: 1 });

      res.json({
        appointments,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = appointmentController;
