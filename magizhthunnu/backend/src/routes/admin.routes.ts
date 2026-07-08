import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as adminController from '../controllers/admin.controller';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const asHandler = (fn: unknown) => fn as (req: Request, res: Response, next: NextFunction) => void;

// All admin routes require admin role
router.use(asHandler(authenticate), asHandler(authorize('admin')));

router.get('/users', asHandler(adminController.getUsers));
router.patch('/users/:userId/status', asHandler(adminController.updateUserStatus));
router.get('/restaurants', asHandler(adminController.getRestaurants));
router.patch('/restaurants/:restaurantId/approve', asHandler(adminController.approveRestaurant));
router.get('/analytics', asHandler(adminController.getAnalytics));

export default router;
