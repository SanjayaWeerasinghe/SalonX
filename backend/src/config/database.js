const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_management';

// MongoDB connection options
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('✓ Connected to MongoDB database');
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    return false;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✓ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = {
  connectDB,
  mongoose,
};
