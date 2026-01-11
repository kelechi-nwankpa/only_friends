import type { ErrorRequestHandler } from 'express';
import { config } from '../config/index.js';
import { AppError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log error
  console.error('Error:', err);

  // Handle known AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(config.isDev && { stack: err.stack }),
      },
    });
    return;
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A record with this value already exists',
      },
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Record not found',
      },
    });
    return;
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isDev ? err.message : 'An unexpected error occurred',
      ...(config.isDev && { stack: err.stack }),
    },
  });
};
