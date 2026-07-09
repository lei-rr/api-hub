const { AppError } = require('../shared/errors');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code
      }
    });
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
}

module.exports = errorHandler;
