import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const asHandler = (fn: unknown) => fn as (req: Request, res: Response, next: NextFunction) => void;

// All user routes require auth
router.use(asHandler(authenticate));

router.get('/me', asHandler(userController.getMe));
router.patch('/me', asHandler(userController.updateProfile));
router.post('/me/addresses', asHandler(userController.addAddress));
router.delete('/me/addresses/:addressId', asHandler(userController.removeAddress));

export default router;
