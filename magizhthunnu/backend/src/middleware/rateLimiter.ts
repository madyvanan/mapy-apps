import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { redisClient } from '../config/redis';
import { AppError } from '../utils/AppError';

const isDev = process.env['NODE_ENV'] === 'development';

const devKeyGenerator = (req: Request): string =>
  `${req.ip ?? req.socket.remoteAddress ?? 'unknown'}:${req.method}:${req.path}`;

const makeHandler = (max: number, windowMs: number, devMax: number) =>
  rateLimit({
    windowMs,
    max: isDev ? devMax : max,
    standardHeaders: true,
    legacyHeaders: false,
    ...(isDev ? { keyGenerator: devKeyGenerator } : {}),
    handler: (_req, _res, next) => {
      next(new AppError('Too many requests, please try again later', 429, 'RATE_LIMITED'));
    },
    skip: () => process.env['NODE_ENV'] === 'test',
  });

export const generalLimiter = makeHandler(100, 15 * 60 * 1000, 1000);
export const authLimiter = makeHandler(5, 15 * 60 * 1000, 50);
export const orderLimiter = makeHandler(10, 60 * 1000, 100);

void redisClient;
