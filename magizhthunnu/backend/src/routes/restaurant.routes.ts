import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as restaurantController from '../controllers/restaurant.controller';
import { AuthenticatedRequest } from '../types';

const asAuth = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthenticatedRequest, res, next);

const authMw = authenticate as unknown as (req: Request, res: Response, next: NextFunction) => void;
const ownerMw = authorize('restaurant', 'admin') as unknown as (req: Request, res: Response, next: NextFunction) => void;

const router = Router();

router.get('/', restaurantController.list);
router.get('/nearby', restaurantController.nearby);
router.get('/search', restaurantController.search);
router.get('/:id', restaurantController.getById);
router.post('/', authMw, ownerMw, asAuth(restaurantController.create));
router.patch('/:id', authMw, ownerMw, asAuth(restaurantController.update));
router.patch('/:id/toggle', authMw, ownerMw, asAuth(restaurantController.toggle));

export default router;
