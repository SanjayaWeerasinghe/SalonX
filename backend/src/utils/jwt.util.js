const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (userId, email, role)
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload (userId)
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, authConfig.jwtRefreshSecret, {
    expiresIn: authConfig.jwtRefreshExpiresIn,
  });
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
};

/**
 * Verify JWT refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwtRefreshSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
