export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message, details) {
  return new AppError(message, 400, 'BAD_REQUEST', details);
}

export function unauthorized(message = 'Authentication required') {
  return new AppError(message, 401, 'UNAUTHORIZED');
}

export function forbidden(message = 'Admin access required') {
  return new AppError(message, 403, 'FORBIDDEN');
}

export function notFound(message = 'Resource not found') {
  return new AppError(message, 404, 'NOT_FOUND');
}

export function conflict(message, details) {
  return new AppError(message, 409, 'CONFLICT', details);
}
