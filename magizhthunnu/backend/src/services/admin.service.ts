import { User } from '../models/User.model';
import { Restaurant } from '../models/Restaurant.model';
import { Order } from '../models/Order.model';
import { Payment } from '../models/Payment.model';
import { AppError } from '../utils/AppError';
import { getPaginationOptions, buildPagination } from '../utils/pagination';
import { Request } from 'express';

export const getUsers = async (req: Request) => {
  const { page, limit, skip } = getPaginationOptions(req);
  const role = req.query['role'] as string | undefined;
  const filter = role ? { role } : {};
  const [users, total] = await Promise.all([
    User.find(filter, '-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, pagination: buildPagination(page, limit, total) };
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true, select: '-passwordHash' });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
};

export const getRestaurants = async (req: Request) => {
  const { page, limit, skip } = getPaginationOptions(req);
  const [restaurants, total] = await Promise.all([
    Restaurant.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Restaurant.countDocuments(),
  ]);
  return { restaurants, pagination: buildPagination(page, limit, total) };
};

export const approveRestaurant = async (restaurantId: string, verified: boolean) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { isVerified: verified },
    { new: true },
  );
  if (!restaurant) throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  return restaurant;
};

export const getAnalytics = async () => {
  const [totalUsers, totalRestaurants, totalOrders, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Restaurant.countDocuments(),
    Order.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalRevenue = (revenueAgg[0] as { total: number } | undefined)?.total ?? 0;

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return { totalUsers, totalRestaurants, totalOrders, totalRevenue, ordersByStatus };
};
