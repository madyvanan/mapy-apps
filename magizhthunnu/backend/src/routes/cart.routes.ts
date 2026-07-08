import { Router, Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as cartController from '../controllers/cart.controller';

const asAuth = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthenticatedRequest, res, next);

const router = Router();

router.get('/', asAuth(cartController.getCart));
router.post('/items', asAuth(cartController.addItem));
router.patch('/items/:itemId', asAuth(cartController.updateItem));
router.delete('/items/:itemId', asAuth(cartController.removeItem));
router.delete('/', asAuth(cartController.clearCart));

export default router;
