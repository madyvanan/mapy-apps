import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import * as paymentController from '../controllers/payment.controller';

const authMw = authenticate as unknown as (req: Request, res: Response, next: NextFunction) => void;
const asAuth = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthenticatedRequest, res, next);

const router = Router();

// webhook must remain public — Paytm calls it directly
router.post('/webhook', paymentController.webhook);

router.post('/initiate', authMw, asAuth(paymentController.initiate));
router.get('/:id', authMw, asAuth(paymentController.getStatus));

export default router;
