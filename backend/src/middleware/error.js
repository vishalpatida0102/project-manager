/* eslint-disable no-unused-vars */
const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details;

  // Mongoose validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field} already in use`;
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  if (process.env.NODE_ENV !== 'test' && status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === 'development' && status >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
