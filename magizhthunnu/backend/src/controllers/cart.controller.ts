import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import * as cartService from '../services/cart.service';

export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const cart = await cartService.getCart(req.user.id);
  res.json({ success: true, data: cart ?? { items: [], totalAmount: 0 } });
});

export const addItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const cart = await cartService.addItem(req.user.id, req.body as never);
  res.json({ success: true, data: cart });
});

export const updateItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const cart = await cartService.updateItemQty(req.user.id, req.params['itemId'], (req.body as { quantity: number }).quantity);
  res.json({ success: true, data: cart });
});

export const removeItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const cart = await cartService.removeItem(req.user.id, req.params['itemId']);
  res.json({ success: true, data: cart });
});

export const clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await cartService.clearCart(req.user.id);
  res.json({ success: true, message: 'Cart cleared' });
});
