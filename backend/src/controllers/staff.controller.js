const Staff = require('../models/schemas/Staff');
const Appointment = require('../models/schemas/Appointment');

const staffController = {
  /**
   * Get all staff members with optional search, filters and pagination
   * GET /api/staff
   * Query params: search, is_active, role, page, limit
   */
  async getAllStaff(req, res, next) {
    try {
      const { search, is_active, role, page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;

      // Build search query
      let query = {};

      if (search) {
        query.$or = [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      if (is_active !== undefined) {
        query.is_active = is_active === 'true';
      }

      if (role) {
        query.role = role;
      }

      // Get staff with pagination
      const staff = await Staff.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Staff.countDocuments(query);

      res.json({
        staff,
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
   * Get staff member by ID
   * GET /api/staff/:id
   */
  async getStaffById(req, res, next) {
    try {
      const { id } = req.params;

      const staffMember = await Staff.findById(id);

      if (!staffMember) {
        return res.status(404).json({
          error: {
            message: 'Staff member not found',
            status: 404,
          },
        });
      }

      res.json({
        staff: staffMember,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new staff member
   * POST /api/staff
   * Body: { first_name, last_name, email, phone, role, specialties, hire_date, is_active, notes }
   */
  async createStaff(req, res, next) {
    try {
      const { first_name, last_name, email, phone, role, specialties, hire_date, is_active, notes } = req.body;

      // Validate required fields
      if (!first_name || !last_name || !email) {
        return res.status(400).json({
          error: {
            message: 'First name, last name, and email are required',
            status: 400,
          },
        });
      }

      // Check if staff member with same email exists
      const existingStaff = await Staff.findOne({ email: email.toLowerCase() });
      if (existingStaff) {
        return res.status(409).json({
          error: {
            message: 'Staff member with this email already exists',
            status: 409,
          },
        });
      }

      // Create staff member
      const staffMember = new Staff({
        first_name,
        last_name,
        email: email.toLowerCase(),
        phone,
        role: role || 'stylist',
        specialties: specialties || [],
        hire_date,
        is_active: is_active !== undefined ? is_active : true,
        notes,
      });

      await staffMember.save();

      res.status(201).json({
        message: 'Staff member created successfully',
        staff: staffMember,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update staff member
   * PUT /api/staff/:id
   * Body: { first_name, last_name, email, phone, role, specialties, hire_date, is_active, notes }
   */
  async updateStaff(req, res, next) {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, phone, role, specialties, hire_date, is_active, notes } = req.body;

      // Check if staff member exists
      const staffMember = await Staff.findById(id);

      if (!staffMember) {
        return res.status(404).json({
          error: {
            message: 'Staff member not found',
            status: 404,
          },
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email.toLowerCase() !== staffMember.email) {
        const existingStaff = await Staff.findOne({
          email: email.toLowerCase(),
          _id: { $ne: id }
        });

        if (existingStaff) {
          return res.status(409).json({
            error: {
              message: 'Staff member with this email already exists',
              status: 409,
            },
          });
        }
      }

      // Update staff member
      staffMember.first_name = first_name || staffMember.first_name;
      staffMember.last_name = last_name || staffMember.last_name;
      staffMember.email = email ? email.toLowerCase() : staffMember.email;
      staffMember.phone = phone !== undefined ? phone : staffMember.phone;
      staffMember.role = role !== undefined ? role : staffMember.role;
      staffMember.specialties = specialties !== undefined ? specialties : staffMember.specialties;
      staffMember.hire_date = hire_date !== undefined ? hire_date : staffMember.hire_date;
      staffMember.is_active = is_active !== undefined ? is_active : staffMember.is_active;
      staffMember.notes = notes !== undefined ? notes : staffMember.notes;

      await staffMember.save();

      res.json({
        message: 'Staff member updated successfully',
        staff: staffMember,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete staff member
   * DELETE /api/staff/:id
   */
  async deleteStaff(req, res, next) {
    try {
      const { id } = req.params;

      // Check if staff member exists
      const staffMember = await Staff.findById(id);

      if (!staffMember) {
        return res.status(404).json({
          error: {
            message: 'Staff member not found',
            status: 404,
          },
        });
      }

      // Delete staff member
      await Staff.findByIdAndDelete(id);

      res.json({
        message: 'Staff member deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle staff member active status
   * PATCH /api/staff/:id/toggle-active
   */
  async toggleActive(req, res, next) {
    try {
      const { id } = req.params;

      // Check if staff member exists
      const staffMember = await Staff.findById(id);

      if (!staffMember) {
        return res.status(404).json({
          error: {
            message: 'Staff member not found',
            status: 404,
          },
        });
      }

      // Toggle active status
      staffMember.is_active = !staffMember.is_active;
      await staffMember.save();

      res.json({
        message: `Staff member ${staffMember.is_active ? 'activated' : 'deactivated'} successfully`,
        staff: staffMember,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = staffController;
