import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import * as restaurantService from '../services/restaurant.service';
import { getPaginationOptions } from '../utils/pagination';

export const list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { cuisine, isOpen, city } = req.query as Record<string, string>;
  const opts = getPaginationOptions(req);
  const { restaurants, pagination } = await restaurantService.listRestaurants(
    { cuisine, isOpen: isOpen === 'true' ? true : isOpen === 'false' ? false : undefined, city },
    opts,
  );
  res.json({ success: true, data: restaurants, pagination });
});

export const nearby = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const lat = parseFloat(req.query['lat'] as string);
  const lng = parseFloat(req.query['lng'] as string);
  const radius = parseFloat(req.query['radius'] as string) || 5;
  const restaurants = await restaurantService.getNearby(lat, lng, radius);
  res.json({ success: true, data: restaurants });
});

export const search = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const q = req.query['q'] as string;
  const restaurants = await restaurantService.searchRestaurants(q);
  res.json({ success: true, data: restaurants });
});

export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const [restaurant, menu] = await Promise.all([
    restaurantService.getRestaurantById(req.params['id']),
    restaurantService.getMenuByRestaurant(req.params['id']),
  ]);
  res.json({ success: true, data: { restaurant, menu } });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const restaurant = await restaurantService.createRestaurant(req.user.id, req.body as never);
  res.status(201).json({ success: true, data: restaurant, message: 'Restaurant created' });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const restaurant = await restaurantService.updateRestaurant(req.params['id'], req.user.id, req.body as never);
  res.json({ success: true, data: restaurant });
});

export const toggle = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const restaurant = await restaurantService.toggleOpen(req.params['id'], req.user.id);
  res.json({ success: true, data: { isOpen: restaurant.isOpen } });
});
