// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Unauthorized';
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    status = 409;
    message = 'Resource already exists';
  }

  // MongoDB validation error
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    status = 400;
    message = err.message;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  }

  // Send error response
  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// 404 Not Found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
    },
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
