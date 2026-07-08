import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import * as reviewController from '../controllers/review.controller';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const asHandler = (fn: unknown) => fn as (req: Request, res: Response, next: NextFunction) => void;

const createReviewSchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10).max(500),
  }),
});

// POST /api/reviews — create review (auth required)
router.post(
  '/',
  asHandler(authenticate),
  validate(createReviewSchema),
  asHandler(reviewController.createReview),
);

// GET /api/reviews/restaurant/:restaurantId — public
router.get('/restaurant/:restaurantId', asHandler(reviewController.getRestaurantReviews));

export default router;
