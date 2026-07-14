import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import * as orderService from '../services/order.service';
import { getPaginationOptions } from '../utils/pagination';

export const placeOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { deliveryAddressId, idempotencyKey } = req.body as { deliveryAddressId: string; idempotencyKey: string };
  const order = await orderService.placeOrder(req.user.id, deliveryAddressId, idempotencyKey);
  res.status(201).json({ success: true, data: order, message: 'Order placed' });
});

export const getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await orderService.getMyOrders(req.user.id, getPaginationOptions(req));
  res.json({ success: true, ...result });
});

export const getOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const order = await orderService.getOrderById(req.params['id'], req.user.id, req.user.role);
  res.json({ success: true, data: order });
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status: string };
  const order = await orderService.updateOrderStatus(req.params['id'], status as never, req.user.id, req.user.role);
  res.json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const order = await orderService.cancelOrder(req.params['id'], req.user.id);
  res.json({ success: true, data: order, message: 'Order cancelled' });
});

export const getRestaurantOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const restaurantId = req.query['restaurantId'] as string;
  const result = await orderService.getRestaurantOrders(restaurantId, getPaginationOptions(req));
  res.json({ success: true, ...result });
});
