import { Review } from '../models/Review.model';
import { Order } from '../models/Order.model';
import { Restaurant } from '../models/Restaurant.model';
import { AppError } from '../utils/AppError';
import { getPaginationOptions, buildPagination } from '../utils/pagination';
import { Request } from 'express';

export const createReview = async (
  userId: string,
  orderId: string,
  rating: number,
  comment: string,
) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.userId.toString() !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.status !== 'delivered') throw new AppError('Can only review delivered orders', 400, 'INVALID_STATE');

  const existing = await Review.findOne({ orderId });
  if (existing) throw new AppError('Review already submitted for this order', 409, 'DUPLICATE');

  const review = await Review.create({
    userId,
    restaurantId: order.restaurantId,
    orderId,
    rating,
    comment,
  });

  const allReviews = await Review.find({ restaurantId: order.restaurantId });
  const avg = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length;
  await Restaurant.findByIdAndUpdate(order.restaurantId, {
    rating: Math.round(avg * 10) / 10,
    totalRatings: allReviews.length,
  });

  return review;
};

export const getRestaurantReviews = async (restaurantId: string, req: Request) => {
  const { page, limit, skip } = getPaginationOptions(req);
  const [reviews, total] = await Promise.all([
    Review.find({ restaurantId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar'),
    Review.countDocuments({ restaurantId }),
  ]);
  return { reviews, pagination: buildPagination(page, limit, total) };
};
