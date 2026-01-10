const app = require('./src/app');
const { connectDB } = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const dbConnected = await connectDB();

    if (!dbConnected) {
      console.error('Failed to connect to MongoDB. Please check your configuration.');
      console.error('Make sure MongoDB is running on your system.');
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('\n==================================================');
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API URL: http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log('==================================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
