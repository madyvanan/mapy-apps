import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest, JwtPayload, UserRole } from '../types';

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies['accessToken'] as string | undefined;
  if (!token) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));

  try {
    const secret = process.env['JWT_SECRET'];
    if (!secret) throw new AppError('Server misconfiguration', 500);
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    next(new AppError('Token invalid or expired', 401, 'UNAUTHORIZED'));
  }
};

export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }
    next();
  };
