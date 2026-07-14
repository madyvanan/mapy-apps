import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as reviewService from '../services/review.service';

export const createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, rating, comment } = req.body as { orderId: string; rating: number; comment: string };
  const review = await reviewService.createReview(req.user.id, orderId, rating, comment);
  res.status(201).json({ success: true, data: { review } });
});

export const getRestaurantReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await reviewService.getRestaurantReviews(req.params['restaurantId'], req);
  res.json({ success: true, data: result });
});
