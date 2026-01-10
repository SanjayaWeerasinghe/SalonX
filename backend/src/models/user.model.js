const User = require('./schemas/User');

const userModel = {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password_hash - Hashed password
   * @param {string} userData.first_name - First name
   * @param {string} userData.last_name - Last name
   * @param {string} userData.role - User role (default: 'admin')
   * @returns {Promise<Object>} Created user object (without password)
   */
  async create(userData) {
    try {
      const user = new User(userData);
      await user.save();

      // Return user without password
      const userObj = user.toJSON();
      return userObj;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} newPasswordHash - New hashed password
   * @returns {Promise<Object>} Updated user object (without password)
   */
  async updatePassword(userId, newPasswordHash) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { password_hash: newPasswordHash },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user object (without password)
   */
  async update(userId, updates) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Get user by ID without password
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User object without password
   */
  async findByIdWithoutPassword(userId) {
    try {
      const user = await User.findById(userId).select('-password_hash');
      return user;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  },
};

module.exports = userModel;
