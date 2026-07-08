import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError && err.isOperational) {
    const body: ApiResponse = {
      success: false,
      error: { code: err.code, message: err.message },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  } satisfies ApiResponse);
};
