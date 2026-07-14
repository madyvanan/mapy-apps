import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as adminService from '../services/admin.service';

export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await adminService.getUsers(req);
  res.json({ success: true, data: result });
});

export const updateUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { isActive } = req.body as { isActive: boolean };
  const user = await adminService.updateUserStatus(req.params['userId'], isActive);
  res.json({ success: true, data: { user } });
});

export const getRestaurants = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await adminService.getRestaurants(req);
  res.json({ success: true, data: result });
});

export const approveRestaurant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { verified } = req.body as { verified: boolean };
  const restaurant = await adminService.approveRestaurant(req.params['restaurantId'], verified);
  res.json({ success: true, data: { restaurant } });
});

export const getAnalytics = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const analytics = await adminService.getAnalytics();
  res.json({ success: true, data: { analytics } });
});
