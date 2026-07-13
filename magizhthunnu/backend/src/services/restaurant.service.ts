import type { Prisma, Restaurant, MenuItem } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import { redisClient } from '../config/redis';
import { PaginationOptions, buildPagination } from '../utils/pagination';
import { Pagination } from '../types';

const CACHE_TTL = 600; // 10 min

interface NearbyRestaurant {
  id: string;
  name: string;
  logo: string | null;
  rating: number;
  distanceM: number;
}

interface SearchedRestaurant {
  id: string;
  name: string;
  description: string | null;
  rating: number;
  rank: number;
}

export const listRestaurants = async (
  filters: { cuisine?: string; isOpen?: boolean; city?: string },
  opts: PaginationOptions,
): Promise<{ restaurants: Restaurant[]; pagination: Pagination }> => {
  const where: Prisma.RestaurantWhereInput = {};
  if (filters.cuisine) where.cuisineTypes = { has: filters.cuisine };
  if (filters.isOpen !== undefined) where.isOpen = filters.isOpen;
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({ where, skip: opts.skip, take: opts.limit, orderBy: { rating: 'desc' } }),
    prisma.restaurant.count({ where }),
  ]);
  return { restaurants, pagination: buildPagination(opts.page, opts.limit, total) };
};

export const getNearby = async (lat: number, lng: number, radiusKm = 5): Promise<NearbyRestaurant[]> => {
  const rows = await prisma.$queryRaw<
    { id: string; name: string; logo: string | null; rating: number; distance_m: number }[]
  >`
    SELECT id, name, logo, rating,
           ST_Distance(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS distance_m
    FROM restaurant
    WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusKm * 1000})
      AND is_open = true AND is_verified = true
    ORDER BY distance_m
    LIMIT 20`;

  return rows.map((r) => ({ id: r.id, name: r.name, logo: r.logo, rating: r.rating, distanceM: r.distance_m }));
};

export const searchRestaurants = async (query: string): Promise<SearchedRestaurant[]> => {
  return prisma.$queryRaw<SearchedRestaurant[]>`
    SELECT id, name, description, rating,
           ts_rank(search_vector, plainto_tsquery('english', ${query})) AS rank
    FROM restaurant
    WHERE search_vector @@ plainto_tsquery('english', ${query}) AND is_verified = true
    ORDER BY rank DESC
    LIMIT 20`;
};

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  const cacheKey = `restaurant:${id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached) as Restaurant;

  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new AppError('Restaurant not found', 404, 'NOT_FOUND');

  await redisClient.set(cacheKey, JSON.stringify(restaurant), 'EX', CACHE_TTL);
  return restaurant;
};

interface CreateRestaurantInput {
  name: string;
  description?: string;
  cuisineTypes?: string[];
  logo?: string;
  coverImage?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export const createRestaurant = async (ownerId: string, data: CreateRestaurantInput): Promise<Restaurant> => {
  return prisma.restaurant.create({ data: { ...data, ownerId, isVerified: false } });
};

export const updateRestaurant = async (
  id: string,
  ownerId: string,
  data: Prisma.RestaurantUpdateInput,
): Promise<Restaurant> => {
  const result = await prisma.restaurant.updateMany({ where: { id, ownerId }, data });
  if (result.count === 0) throw new AppError('Restaurant not found or unauthorized', 404, 'NOT_FOUND');
  await redisClient.del(`restaurant:${id}`);
  return prisma.restaurant.findUniqueOrThrow({ where: { id } });
};

export const toggleOpen = async (id: string, ownerId: string): Promise<Restaurant> => {
  const restaurant = await prisma.restaurant.findFirst({ where: { id, ownerId } });
  if (!restaurant) throw new AppError('Restaurant not found or unauthorized', 404, 'NOT_FOUND');

  const updated = await prisma.restaurant.update({ where: { id }, data: { isOpen: !restaurant.isOpen } });
  await redisClient.del(`restaurant:${id}`);
  return updated;
};

export const getMenuByRestaurant = async (restaurantId: string): Promise<Record<string, MenuItem[]>> => {
  const cacheKey = `menu:restaurant:${restaurantId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached) as Record<string, MenuItem[]>;

  const items = await prisma.menuItem.findMany({
    where: { restaurantId, isAvailable: true },
    orderBy: { category: 'asc' },
  });
  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(item);
    return acc;
  }, {});

  await redisClient.set(cacheKey, JSON.stringify(grouped), 'EX', CACHE_TTL);
  return grouped;
};

