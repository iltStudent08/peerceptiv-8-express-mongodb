const handleCastError = (err) => ({ statusCode: 400, message: `Invalid ${err.path}: ${err.value}` });

const handleDuplicateFieldError = () => ({
  statusCode: 409,
  message: 'Duplicate field value. Please use another value.'
});

const handleValidationError = (err) => ({
  statusCode: 400,
  message: Object.values(err.errors)
    .map((val) => val.message)
    .join(', ')
});

const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'CastError') {
    ({ statusCode, message } = handleCastError(err));
  }

  if (err.code === 11000) {
    ({ statusCode, message } = handleDuplicateFieldError(err));
  }

  if (err.name === 'ValidationError') {
    ({ statusCode, message } = handleValidationError(err));
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message
  });
};

module.exports = errorHandler;
