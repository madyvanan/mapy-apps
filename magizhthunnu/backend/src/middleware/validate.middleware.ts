import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors.map((e) => e.message).join(', ');
        return next(new AppError(message, 400, 'VALIDATION_ERROR'));
      }
      next(err);
    }
  };
