const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth');

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, authConfig.bcryptSaltRounds);
};

/**
 * Compare plain text password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long',
    };
  }

  if (password.length > 100) {
    return {
      isValid: false,
      message: 'Password must be less than 100 characters',
    };
  }

  return {
    isValid: true,
    message: 'Password is valid',
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePassword,
};
