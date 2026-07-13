import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma, isNotFoundError } from '../config/db';
import { AppError } from '../utils/AppError';

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allowed = ['name', 'phone', 'avatar'] as const;
  const body = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const user = await prisma.user.update({ where: { id: req.user.id }, data: updates }).catch((err) => {
    if (isNotFoundError(err)) return null;
    throw err;
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: { user } });
});

export const addAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  const { label, street, city, state, pincode, coordinates, isDefault } = req.body as {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { lat?: number; lng?: number };
    isDefault?: boolean;
  };

  await prisma.address.create({
    data: {
      userId: user.id,
      label,
      street,
      city,
      state,
      pincode,
      lat: coordinates?.lat ?? 0,
      lng: coordinates?.lng ?? 0,
      isDefault: isDefault ?? false,
    },
  });

  const addresses = await prisma.address.findMany({ where: { userId: user.id } });
  res.status(201).json({ success: true, data: { addresses } });
});

export const removeAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const addressId = req.params['addressId'];
  const result = await prisma.address.deleteMany({ where: { id: addressId, userId: req.user.id } });
  if (result.count === 0) throw new AppError('Address not found', 404, 'NOT_FOUND');

  const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
  res.json({ success: true, data: { addresses } });
});
