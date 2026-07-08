import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as reviewService from '../services/review.service';

export const createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const review = await reviewService.createReview(
    req.user.id,
    req.body.orderId as string,
    req.body.rating as number,
    req.body.comment as string,
  );
  res.status(201).json({ success: true, data: { review } });
});

export const getRestaurantReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await reviewService.getRestaurantReviews(req.params['restaurantId'] as string, req);
  res.json({ success: true, data: result });
});
