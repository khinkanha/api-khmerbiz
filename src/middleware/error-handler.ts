import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index';
import { AppError } from '../utils/errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
      errors: err.details,
    });
  }

  // Prisma/Objection errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: false,
      message: 'Validation error',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: false,
      message: 'Invalid token',
    });
  }

  // Unknown error
  console.error('Unhandled error:', err);
  return res.status(500).json({
    status: false,
    message: config.isDev ? err.message : 'Internal server error',
    ...(config.isDev && { stack: err.stack }),
  });
}
