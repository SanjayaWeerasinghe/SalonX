const userModel = require('../models/user.model');
const { comparePassword, hashPassword, validatePassword } = require('../utils/password.util');
const { generateToken, generateRefreshToken } = require('../utils/jwt.util');

const authController = {
  /**
   * Login endpoint
   * POST /api/auth/login
   * Body: { email, password }
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: {
            message: 'Email and password are required',
            status: 400,
          },
        });
      }

      // Find user by email
      const user = await userModel.findByEmail(email.toLowerCase());

      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Invalid email or password',
            status: 401,
          },
        });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: {
            message: 'Invalid email or password',
            status: 401,
          },
        });
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Return user data (without password) and tokens
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user endpoint
   * GET /api/auth/me
   * Requires authentication
   */
  async me(req, res, next) {
    try {
      const userId = req.user.userId;

      // Get user data without password
      const user = await userModel.findByIdWithoutPassword(userId);

      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            status: 404,
          },
        });
      }

      res.json({
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change password endpoint
   * POST /api/auth/change-password
   * Body: { currentPassword, newPassword }
   * Requires authentication
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: {
            message: 'Current password and new password are required',
            status: 400,
          },
        });
      }

      // Validate new password strength
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: {
            message: passwordValidation.message,
            status: 400,
          },
        });
      }

      // Get user with password hash
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            status: 404,
          },
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: {
            message: 'Current password is incorrect',
            status: 401,
          },
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await userModel.updatePassword(userId, newPasswordHash);

      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout endpoint
   * POST /api/auth/logout
   * Note: Since we're using stateless JWT, logout is handled client-side
   * This endpoint is just for completeness
   */
  async logout(req, res) {
    res.json({
      message: 'Logout successful. Please clear your tokens on the client side.',
    });
  },
};

module.exports = authController;
