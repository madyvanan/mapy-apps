import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import * as authController from '../controllers/auth.controller';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticate as unknown as (req: Request, res: Response, next: NextFunction) => void, (req, res, next) => authController.logout(req as AuthenticatedRequest, res, next));
router.post('/refresh', authController.refresh);
router.get('/me', authenticate as unknown as (req: Request, res: Response, next: NextFunction) => void, (req, res, next) => authController.getMe(req as AuthenticatedRequest, res, next));
router.get('/isValid=:token', authController.verifyEmail);
router.post('/verify-mobile-otp', authLimiter, authController.verifyMobileOtp);

export default router;
