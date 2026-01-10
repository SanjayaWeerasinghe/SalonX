const Customer = require('../models/schemas/Customer');
const Service = require('../models/schemas/Service');
const Appointment = require('../models/schemas/Appointment');
const Invoice = require('../models/schemas/Invoice');

const dashboardController = {
  /**
   * Get dashboard overview statistics
   * GET /api/dashboard/overview
   * Query params: date_from, date_to (defaults to current month)
   */
  async getOverview(req, res, next) {
    try {
      const { date_from, date_to } = req.query;

      // Default to current month if no dates provided
      const startDate = date_from
        ? new Date(date_from)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const endDate = date_to
        ? new Date(date_to)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

      // Total customers
      const totalCustomers = await Customer.countDocuments();

      // New customers in period
      const newCustomers = await Customer.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      // Total appointments in period
      const totalAppointments = await Appointment.countDocuments({
        appointment_date: { $gte: startDate, $lte: endDate }
      });

      // Completed appointments in period
      const completedAppointments = await Appointment.countDocuments({
        appointment_date: { $gte: startDate, $lte: endDate },
        status: 'completed'
      });

      // Cancelled appointments in period
      const cancelledAppointments = await Appointment.countDocuments({
        appointment_date: { $gte: startDate, $lte: endDate },
        status: 'cancelled'
      });

      // Upcoming appointments
      const upcomingAppointments = await Appointment.countDocuments({
        appointment_date: { $gte: new Date() },
        status: 'scheduled'
      });

      // Revenue statistics
      const invoices = await Invoice.find({
        issue_date: { $gte: startDate, $lte: endDate }
      });

      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const paidRevenue = invoices
        .filter(inv => inv.payment_status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);
      const pendingRevenue = invoices
        .filter(inv => inv.payment_status === 'unpaid')
        .reduce((sum, inv) => sum + inv.total, 0);

      // Total invoices
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(inv => inv.payment_status === 'paid').length;
      const unpaidInvoices = invoices.filter(inv => inv.payment_status === 'unpaid').length;

      // Active services
      const activeServices = await Service.countDocuments({ is_active: true });

      res.json({
        period: {
          start: startDate,
          end: endDate,
        },
        customers: {
          total: totalCustomers,
          new: newCustomers,
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          upcoming: upcomingAppointments,
        },
        revenue: {
          total: totalRevenue,
          paid: paidRevenue,
          pending: pendingRevenue,
        },
        invoices: {
          total: totalInvoices,
          paid: paidInvoices,
          unpaid: unpaidInvoices,
        },
        services: {
          active: activeServices,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get revenue chart data
   * GET /api/dashboard/revenue-chart
   * Query params: period (week, month, year), date_from, date_to
   */
  async getRevenueChart(req, res, next) {
    try {
      const { period = 'month', date_from, date_to } = req.query;

      let startDate, endDate, groupFormat;

      if (date_from && date_to) {
        startDate = new Date(date_from);
        endDate = new Date(date_to);
      } else {
        const now = new Date();

        switch (period) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            endDate = new Date();
            groupFormat = '%Y-%m-%d';
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            groupFormat = '%Y-%m';
            break;
          case 'month':
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            groupFormat = '%Y-%m-%d';
            break;
        }
      }

      // Aggregate revenue by date
      const revenueData = await Invoice.aggregate([
        {
          $match: {
            issue_date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat || '%Y-%m-%d',
                date: '$issue_date',
              },
            },
            totalRevenue: { $sum: '$total' },
            paidRevenue: {
              $sum: {
                $cond: [{ $eq: ['$payment_status', 'paid'] }, '$total', 0],
              },
            },
            invoiceCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.json({
        period: {
          start: startDate,
          end: endDate,
        },
        data: revenueData.map(item => ({
          date: item._id,
          total: item.totalRevenue,
          paid: item.paidRevenue,
          invoices: item.invoiceCount,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get appointment statistics
   * GET /api/dashboard/appointment-stats
   * Query params: date_from, date_to
   */
  async getAppointmentStats(req, res, next) {
    try {
      const { date_from, date_to } = req.query;

      const startDate = date_from
        ? new Date(date_from)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const endDate = date_to
        ? new Date(date_to)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

      // Appointments by status
      const statusStats = await Appointment.aggregate([
        {
          $match: {
            appointment_date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      // Appointments by date
      const dailyStats = await Appointment.aggregate([
        {
          $match: {
            appointment_date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$appointment_date',
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.json({
        period: {
          start: startDate,
          end: endDate,
        },
        byStatus: statusStats.map(item => ({
          status: item._id,
          count: item.count,
        })),
        byDate: dailyStats.map(item => ({
          date: item._id,
          count: item.count,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get top customers by revenue
   * GET /api/dashboard/top-customers
   * Query params: limit (default 10), date_from, date_to
   */
  async getTopCustomers(req, res, next) {
    try {
      const { limit = 10, date_from, date_to } = req.query;

      let matchStage = {};
      if (date_from || date_to) {
        matchStage.issue_date = {};
        if (date_from) matchStage.issue_date.$gte = new Date(date_from);
        if (date_to) matchStage.issue_date.$lte = new Date(date_to);
      }

      const topCustomers = await Invoice.aggregate([
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        {
          $group: {
            _id: '$customer_id',
            totalRevenue: { $sum: '$total' },
            invoiceCount: { $sum: 1 },
            paidAmount: { $sum: '$paid_amount' },
          },
        },
        {
          $sort: { totalRevenue: -1 },
        },
        {
          $limit: parseInt(limit),
        },
        {
          $lookup: {
            from: 'customers',
            localField: '_id',
            foreignField: '_id',
            as: 'customer',
          },
        },
        {
          $unwind: '$customer',
        },
        {
          $project: {
            _id: 0,
            customer_id: '$_id',
            customer_name: {
              $concat: ['$customer.first_name', ' ', '$customer.last_name'],
            },
            customer_email: '$customer.email',
            total_revenue: '$totalRevenue',
            invoice_count: '$invoiceCount',
            paid_amount: '$paidAmount',
          },
        },
      ]);

      res.json({
        customers: topCustomers,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get popular services
   * GET /api/dashboard/popular-services
   * Query params: limit (default 10), date_from, date_to
   */
  async getPopularServices(req, res, next) {
    try {
      const { limit = 10, date_from, date_to } = req.query;

      let matchStage = {};
      if (date_from || date_to) {
        matchStage.appointment_date = {};
        if (date_from) matchStage.appointment_date.$gte = new Date(date_from);
        if (date_to) matchStage.appointment_date.$lte = new Date(date_to);
      }

      const popularServices = await Appointment.aggregate([
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        { $unwind: '$services' },
        {
          $group: {
            _id: '$services.service_id',
            bookingCount: { $sum: '$services.quantity' },
            totalRevenue: {
              $sum: {
                $multiply: ['$services.quantity', '$services.price_at_time'],
              },
            },
          },
        },
        {
          $sort: { bookingCount: -1 },
        },
        {
          $limit: parseInt(limit),
        },
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: '_id',
            as: 'service',
          },
        },
        {
          $unwind: '$service',
        },
        {
          $project: {
            _id: 0,
            service_id: '$_id',
            service_name: '$service.name',
            current_price: '$service.price',
            booking_count: '$bookingCount',
            total_revenue: '$totalRevenue',
          },
        },
      ]);

      res.json({
        services: popularServices,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recent activities
   * GET /api/dashboard/recent-activity
   * Query params: limit (default 20)
   */
  async getRecentActivity(req, res, next) {
    try {
      const { limit = 20 } = req.query;

      // Get recent appointments
      const recentAppointments = await Appointment.find()
        .populate('customer_id', 'first_name last_name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) / 2);

      // Get recent invoices
      const recentInvoices = await Invoice.find()
        .populate('customer_id', 'first_name last_name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) / 2);

      // Combine and format activities
      const activities = [
        ...recentAppointments.map(apt => ({
          type: 'appointment',
          id: apt._id,
          customer: `${apt.customer_id.first_name} ${apt.customer_id.last_name}`,
          date: apt.appointment_date,
          status: apt.status,
          createdAt: apt.createdAt,
        })),
        ...recentInvoices.map(inv => ({
          type: 'invoice',
          id: inv._id,
          invoice_number: inv.invoice_number,
          customer: `${inv.customer_id.first_name} ${inv.customer_id.last_name}`,
          amount: inv.total,
          payment_status: inv.payment_status,
          createdAt: inv.createdAt,
        })),
      ];

      // Sort by creation date
      activities.sort((a, b) => b.createdAt - a.createdAt);

      res.json({
        activities: activities.slice(0, parseInt(limit)),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dashboardController;
