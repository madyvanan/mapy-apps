import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { connectDB } from './config/db';
import { redisClient } from './config/redis';
import { logger, morganStream } from './config/logger';
import { generalLimiter, orderLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './services/socket.service';
import { authenticate } from './middleware/auth.middleware';

import authRouter from './routes/auth.routes';
import restaurantRouter from './routes/restaurant.routes';
import cartRouter from './routes/cart.routes';
import orderRouter from './routes/order.routes';
import paymentRouter from './routes/payment.routes';
import reviewRouter from './routes/review.routes';
import userRouter from './routes/user.routes';
import adminRouter from './routes/admin.routes';

import { Request, Response, NextFunction } from 'express';

const app = express();
const httpServer = http.createServer(app);

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:5173'],
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://securegw.paytm.in', 'https://securegw-stage.paytm.in'],
      frameSrc: ['https://securegw.paytm.in', 'https://securegw-stage.paytm.in'],
      imgSrc: ["'self'", 'https://res.cloudinary.com', 'data:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

app.use(generalLimiter);
app.use(morgan('combined', { stream: morganStream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression() as unknown as (req: Request, res: Response, next: NextFunction) => void);

// ── Health check ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/cart', authenticate as unknown as (req: Request, res: Response, next: NextFunction) => void, cartRouter);
app.use('/api/orders', authenticate as unknown as (req: Request, res: Response, next: NextFunction) => void, orderLimiter, orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);

// ── 404 handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ── Global error handler ─────────────────────────────────
app.use(errorHandler);

// ── Startup ───────────────────────────────────────────────
const PORT = parseInt(process.env['PORT'] ?? '5000', 10);

const start = async (): Promise<void> => {
  await connectDB();
  await redisClient.connect().catch(() => logger.warn('Redis connect skipped (lazy)'));
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env['NODE_ENV'] ?? 'development'}]`);
  });
};

if (process.env['NODE_ENV'] !== 'test') {
  start().catch((err) => {
    logger.error('Failed to start server', err);
    process.exit(1);
  });
}

export { app, httpServer };
