export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.statusCode || (error.name === 'MulterError' ? 400 : 500);
  const response = {
    message: error.message || 'Unexpected server error',
    code: error.code || (error.name === 'MulterError' ? 'UPLOAD_ERROR' : 'SERVER_ERROR')
  };

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}
