import { Router, Request, Response, NextFunction } from 'express';
import { authorize } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import * as orderController from '../controllers/order.controller';

const asAuth = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthenticatedRequest, res, next);

const ownerAdminMw = authorize('restaurant', 'admin') as unknown as (req: Request, res: Response, next: NextFunction) => void;

const router = Router();

router.post('/', asAuth(orderController.placeOrder));
router.get('/my', asAuth(orderController.getMyOrders));
router.get('/restaurant', ownerAdminMw, asAuth(orderController.getRestaurantOrders));
router.get('/:id', asAuth(orderController.getOrder));
router.patch('/:id/status', ownerAdminMw, asAuth(orderController.updateStatus));
router.post('/:id/cancel', asAuth(orderController.cancelOrder));

export default router;
