const { verifyToken } = require('../utils/jwt.util');

/**
 * Middleware to verify JWT token and authenticate requests
 * Protects routes that require authentication
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: {
          message: 'No authorization token provided',
          status: 401,
        },
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: {
          message: 'Invalid authorization format. Use: Bearer <token>',
          status: 401,
        },
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: error.message || 'Invalid or expired token',
        status: 401,
      },
    });
  }
};

/**
 * Middleware to check if user has admin role
 * Must be used after authMiddleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Authentication required',
        status: 401,
      },
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        message: 'Admin access required',
        status: 403,
      },
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  adminOnly,
};
