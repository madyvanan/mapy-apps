import { Request } from 'express';
import { prisma, isNotFoundError } from '../config/db';
import { AppError } from '../utils/AppError';
import { getPaginationOptions, buildPagination } from '../utils/pagination';
import { UserRole } from '../types';

export const getUsers = async (req: Request) => {
  const { page, limit, skip } = getPaginationOptions(req);
  const role = req.query['role'] as UserRole | undefined;
  const where = role ? { role } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.user.count({ where }),
  ]);
  return { users, pagination: buildPagination(page, limit, total) };
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await prisma.user.update({ where: { id: userId }, data: { isActive } }).catch((err) => {
    if (isNotFoundError(err)) return null;
    throw err;
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
};

export const getRestaurants = async (req: Request) => {
  const { page, limit, skip } = getPaginationOptions(req);
  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.restaurant.count(),
  ]);
  return { restaurants, pagination: buildPagination(page, limit, total) };
};

export const approveRestaurant = async (restaurantId: string, verified: boolean) => {
  const restaurant = await prisma.restaurant
    .update({ where: { id: restaurantId }, data: { isVerified: verified } })
    .catch((err) => {
      if (isNotFoundError(err)) return null;
      throw err;
    });
  if (!restaurant) throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  return restaurant;
};

export const getAnalytics = async () => {
  const [totalUsers, totalRestaurants, totalOrders, revenueAgg] = await Promise.all([
    prisma.user.count(),
    prisma.restaurant.count(),
    prisma.order.count(),
    prisma.payment.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0);

  const ordersByStatusRaw = await prisma.order.groupBy({ by: ['status'], _count: true });
  const ordersByStatus = ordersByStatusRaw.map((r) => ({ _id: r.status, count: r._count }));

  return { totalUsers, totalRestaurants, totalOrders, totalRevenue, ordersByStatus };
};
