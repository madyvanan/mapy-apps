import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../types';
import * as authService from '../services/auth.service';
import { prisma } from '../config/db';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
};

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, mobile, role } = req.body as {
    name: string; email: string; password: string; mobile: string; role?: 'customer' | 'restaurant';
  };
  const user = await authService.registerUser({ name, email, password, mobile, role });
  const verificationRequired = process.env['NODE_ENV'] === 'production';
  res.status(201).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mailVerificationRequired: verificationRequired,
      mobileVerificationRequired: verificationRequired,
    },
    message: 'Account created',
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params as { token: string };
  const verified = await authService.verifyEmailToken(token);
  res.json({ success: true, data: { verified } });
});

export const verifyMobileOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId, otp } = req.body as { userId: string; otp: string };
  await authService.verifyMobileOtp(userId, otp);
  res.json({ success: true, message: 'Mobile number verified' });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const { user, tokens } = await authService.loginUser(email, password);

  res.cookie('accessToken', tokens.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', tokens.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role }, message: 'Login successful' });
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await authService.logoutUser(req.user.id);
  res.clearCookie('accessToken', COOKIE_OPTS);
  res.clearCookie('refreshToken', COOKIE_OPTS);
  res.json({ success: true, message: 'Logged out' });
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies['refreshToken'] as string | undefined;
  if (!token) throw new AppError('No refresh token', 401, 'UNAUTHORIZED');
  const accessToken = await authService.refreshAccessToken(token);
  res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.json({ success: true, message: 'Token refreshed' });
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: user });
});

// Cast helpers for mixed requests
export { logout as logoutHandler };
