const Service = require('../models/schemas/Service');

const serviceController = {
  /**
   * Get all services
   * GET /api/services
   * Query params: is_active, search
   */
  async getAllServices(req, res, next) {
    try {
      const { is_active, search } = req.query;

      // Build query
      let query = {};

      if (is_active !== undefined) {
        query.is_active = is_active === 'true';
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Get services
      const services = await Service.find(query).sort({ name: 1 });

      res.json({
        services,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get service by ID
   * GET /api/services/:id
   */
  async getServiceById(req, res, next) {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          error: {
            message: 'Service not found',
            status: 404,
          },
        });
      }

      res.json({
        service,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new service
   * POST /api/services
   * Body: { name, description, price, duration_minutes, is_active }
   */
  async createService(req, res, next) {
    try {
      const { name, description, price, duration_minutes, is_active } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          error: {
            message: 'Service name is required',
            status: 400,
          },
        });
      }

      if (price === undefined || price === null) {
        return res.status(400).json({
          error: {
            message: 'Service price is required',
            status: 400,
          },
        });
      }

      if (price < 0) {
        return res.status(400).json({
          error: {
            message: 'Service price must be a positive number',
            status: 400,
          },
        });
      }

      // Check if service with same name exists
      const existingService = await Service.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });

      if (existingService) {
        return res.status(409).json({
          error: {
            message: 'Service with this name already exists',
            status: 409,
          },
        });
      }

      // Create service
      const service = new Service({
        name,
        description,
        price,
        duration_minutes,
        is_active: is_active !== undefined ? is_active : true,
      });

      await service.save();

      res.status(201).json({
        message: 'Service created successfully',
        service,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update service
   * PUT /api/services/:id
   * Body: { name, description, price, duration_minutes, is_active }
   */
  async updateService(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, price, duration_minutes, is_active } = req.body;

      // Check if service exists
      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          error: {
            message: 'Service not found',
            status: 404,
          },
        });
      }

      // Validate price if provided
      if (price !== undefined && price < 0) {
        return res.status(400).json({
          error: {
            message: 'Service price must be a positive number',
            status: 400,
          },
        });
      }

      // Check if name is being changed and if it's already taken
      if (name && name.toLowerCase() !== service.name.toLowerCase()) {
        const existingService = await Service.findOne({
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: id }
        });

        if (existingService) {
          return res.status(409).json({
            error: {
              message: 'Service with this name already exists',
              status: 409,
            },
          });
        }
      }

      // Update service
      service.name = name || service.name;
      service.description = description !== undefined ? description : service.description;
      service.price = price !== undefined ? price : service.price;
      service.duration_minutes = duration_minutes !== undefined ? duration_minutes : service.duration_minutes;
      service.is_active = is_active !== undefined ? is_active : service.is_active;

      await service.save();

      res.json({
        message: 'Service updated successfully',
        service,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete service (soft delete by setting is_active to false)
   * DELETE /api/services/:id
   */
  async deleteService(req, res, next) {
    try {
      const { id } = req.params;
      const { hard_delete } = req.query;

      // Check if service exists
      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          error: {
            message: 'Service not found',
            status: 404,
          },
        });
      }

      if (hard_delete === 'true') {
        // Hard delete
        await Service.findByIdAndDelete(id);
        res.json({
          message: 'Service permanently deleted',
        });
      } else {
        // Soft delete - just mark as inactive
        service.is_active = false;
        await service.save();
        res.json({
          message: 'Service deactivated successfully',
          service,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Activate a service
   * POST /api/services/:id/activate
   */
  async activateService(req, res, next) {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          error: {
            message: 'Service not found',
            status: 404,
          },
        });
      }

      service.is_active = true;
      await service.save();

      res.json({
        message: 'Service activated successfully',
        service,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = serviceController;
