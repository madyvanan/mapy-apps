import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { User, IAddress } from '../models/User.model';
import { AppError } from '../utils/AppError';

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user.id, '-passwordHash');
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allowed = ['name', 'phone', 'avatar'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, select: '-passwordHash' });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: { user } });
});

export const addAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, data: { addresses: user.addresses } });
});

export const removeAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  const before = user.addresses.length;
  user.addresses = user.addresses.filter(
    (a: IAddress & { _id?: unknown }) =>
      (a._id as { toString: () => string }).toString() !== req.params['addressId'],
  );
  if (user.addresses.length === before) throw new AppError('Address not found', 404, 'NOT_FOUND');
  await user.save();
  res.json({ success: true, data: { addresses: user.addresses } });
});
