import { Restaurant, IRestaurant } from '../models/Restaurant.model';
import { MenuItem } from '../models/MenuItem.model';
import { AppError } from '../utils/AppError';
import { redisClient } from '../config/redis';
import { PaginationOptions, buildPagination } from '../utils/pagination';
import { Pagination } from '../types';

const CACHE_TTL = 600; // 10 min

export const listRestaurants = async (
  filters: { cuisine?: string; isOpen?: boolean; city?: string },
  opts: PaginationOptions,
): Promise<{ restaurants: IRestaurant[]; pagination: Pagination }> => {
  const query: Record<string, unknown> = {};
  if (filters.cuisine) query['cuisineTypes'] = filters.cuisine;
  if (filters.isOpen !== undefined) query['isOpen'] = filters.isOpen;
  if (filters.city) query['address.city'] = new RegExp(filters.city, 'i');

  const [restaurants, total] = await Promise.all([
    Restaurant.find(query).skip(opts.skip).limit(opts.limit).sort({ rating: -1 }),
    Restaurant.countDocuments(query),
  ]);
  return { restaurants, pagination: buildPagination(opts.page, opts.limit, total) };
};

export const getNearby = async (lat: number, lng: number, radiusKm = 5): Promise<IRestaurant[]> => {
  return Restaurant.find({
    'address.location': {
      $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: radiusKm * 1000 },
    },
    isOpen: true,
    isVerified: true,
  }).limit(20);
};

export const searchRestaurants = async (query: string): Promise<IRestaurant[]> => {
  return Restaurant.find({ $text: { $search: query }, isVerified: true }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);
};

export const getRestaurantById = async (id: string): Promise<IRestaurant> => {
  const cacheKey = `restaurant:${id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached) as IRestaurant;

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw new AppError('Restaurant not found', 404, 'NOT_FOUND');

  await redisClient.set(cacheKey, JSON.stringify(restaurant), 'EX', CACHE_TTL);
  return restaurant;
};

export const createRestaurant = async (
  ownerId: string,
  data: Partial<IRestaurant>,
): Promise<IRestaurant> => {
  const restaurant = new Restaurant({ ...data, ownerId, isVerified: false });
  return restaurant.save();
};

export const updateRestaurant = async (
  id: string,
  ownerId: string,
  data: Partial<IRestaurant>,
): Promise<IRestaurant> => {
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: id, ownerId },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!restaurant) throw new AppError('Restaurant not found or unauthorized', 404, 'NOT_FOUND');
  await redisClient.del(`restaurant:${id}`);
  return restaurant;
};

export const toggleOpen = async (id: string, ownerId: string): Promise<IRestaurant> => {
  const restaurant = await Restaurant.findOne({ _id: id, ownerId });
  if (!restaurant) throw new AppError('Restaurant not found or unauthorized', 404, 'NOT_FOUND');
  restaurant.isOpen = !restaurant.isOpen;
  await restaurant.save();
  await redisClient.del(`restaurant:${id}`);
  return restaurant;
};

export const getMenuByRestaurant = async (restaurantId: string): Promise<unknown> => {
  const cacheKey = `menu:restaurant:${restaurantId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached) as unknown;

  const items = await MenuItem.find({ restaurantId, isAvailable: true }).sort({ category: 1 });
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(item);
    return acc;
  }, {});

  await redisClient.set(cacheKey, JSON.stringify(grouped), 'EX', CACHE_TTL);
  return grouped;
};
