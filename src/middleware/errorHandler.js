'use strict';

const AppError = require('../utils/AppError');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof AppError)) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      error = new AppError(messages.join('; '), 400, 'VALIDATION_ERROR');
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      error = new AppError(`${field} already exists.`, 409, 'DUPLICATE_KEY');
    } else if (error.name === 'CastError') {
      error = new AppError(`Invalid ${error.path}: ${error.value}`, 400, 'INVALID_ID');
    } else if (error.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token.', 401, 'TOKEN_INVALID');
    } else if (error.name === 'TokenExpiredError') {
      error = new AppError('Token expired.', 401, 'TOKEN_EXPIRED');
    } else {
      error = new AppError(error.message || 'Internal server error', error.statusCode || 500);
    }
  }

  const statusCode = error.statusCode || 500;

  if (env.NODE_ENV === 'development') {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    status: error.status || 'error',
    code: error.code || 'INTERNAL_ERROR',
    message: error.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { AppError, errorHandler };
