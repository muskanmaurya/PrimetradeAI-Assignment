const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || res.statusCode;
  let message = error.message || 'Internal server error';

  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
  }

  if (error.code === 11000) {
    statusCode = 400;
    const duplicatedField = Object.keys(error.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${duplicatedField}`;
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
