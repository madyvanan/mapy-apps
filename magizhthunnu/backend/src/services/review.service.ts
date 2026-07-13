import { Request } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import { getPaginationOptions, buildPagination } from '../utils/pagination';

export const createReview = async (userId: string, orderId: string, rating: number, comment: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.status !== 'delivered') throw new AppError('Can only review delivered orders', 400, 'INVALID_STATE');

  const existing = await prisma.review.findUnique({ where: { orderId } });
  if (existing) throw new AppError('Review already submitted for this order', 409, 'DUPLICATE');

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: { userId, restaurantId: order.restaurantId, orderId, rating, comment },
    });

    const agg = await tx.review.aggregate({
      where: { restaurantId: order.restaurantId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.restaurant.update({
      where: { id: order.restaurantId },
      data: {
        rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
        totalRatings: agg._count,
      },
    });

    return review;
  });
};

export const getRestaurantReviews = async (restaurantId: string, req: Request) => {
  const { page, limit, skip } = getPaginationOptions(req);
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { name: true, avatar: true } } },
    }),
    prisma.review.count({ where: { restaurantId } }),
  ]);
  return { reviews, pagination: buildPagination(page, limit, total) };
};
