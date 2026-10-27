import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ERROR_REGISTRY } from '../config/errorRegistry.js';
import { ENV } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  let httpStatus = 500;
  let code = '500';
  let message = 'An unexpected server error occurred. Please try again.';
  let details: any = undefined;

  if (err instanceof AppError) {
    code = err.code;
    httpStatus = err.httpStatus;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    code = '400';
    httpStatus = 400;
    message = 'Validation failed. Please verify your inputs.';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.status || err.statusCode) {
    httpStatus = err.status || err.statusCode;
    if (httpStatus === 404) code = '404';
    else if (httpStatus === 401) code = '401';
    else if (httpStatus === 403) code = '403';
    else if (httpStatus === 429) code = '429';
    else if (httpStatus === 503) code = '503';
    message = err.message || ERROR_REGISTRY[code]?.explanation || 'Error';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    code = '401';
    httpStatus = 401;
    message = 'Authentication token is invalid or expired. Please sign in again.';
  }

  // Mask internal details in production
  if (httpStatus >= 500 && ENV.NODE_ENV === 'production') {
    message = 'Internal Server Error. Our team has been notified.';
  } else if (httpStatus >= 500 && !message) {
    message = err.message || 'Internal Server Error';
  }

  res.locals.errorMessage = message;
  res.locals.error = err;

  res.status(httpStatus).json({
    success: false,
    error: {
      code,
      message,
      requestId,
      ...(details ? { details } : {}),
      ...(ENV.NODE_ENV !== 'production' && httpStatus >= 500 ? { stack: err.stack } : {}),
    },
  });
}
