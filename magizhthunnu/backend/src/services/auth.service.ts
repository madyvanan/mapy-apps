import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { redisClient } from '../config/redis';
import { JwtPayload, UserRole } from '../types';
import { sendVerificationEmail } from './email.service';
import { sendOtpSms } from './sms.service';
import { logger } from '../config/logger';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  mobile: string;
  role?: UserRole;
}

interface EmailVerifyTokenPayload {
  userId: string;
  valid: true;
}

const OTP_TTL_MS = 10 * 60 * 1000;

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const signAccessToken = (userId: string, role: UserRole): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new AppError('Server misconfiguration', 500);
  return jwt.sign({ userId, role } satisfies JwtPayload, secret, {
    expiresIn: 15 * 60,
  });
};

const signRefreshToken = (userId: string, role: UserRole): string => {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new AppError('Server misconfiguration', 500);
  return jwt.sign({ userId, role } satisfies JwtPayload, secret, {
    expiresIn: 7 * 24 * 60 * 60,
  });
};

export const registerUser = async (input: RegisterInput): Promise<IUser> => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError('Email already in use', 400, 'EMAIL_EXISTS');

  const user = new User({
    name: input.name,
    email: input.email,
    passwordHash: input.password,
    phone: input.mobile,
    role: input.role ?? 'customer',
  });

  if (process.env['NODE_ENV'] === 'production') {
    const userId = (user._id as unknown as { toString(): string }).toString();

    const secret = process.env['JWT_SECRET'];
    if (!secret) throw new AppError('Server misconfiguration', 500);
    const token = jwt.sign({ userId, valid: true } satisfies EmailVerifyTokenPayload, secret, {
      expiresIn: '24h',
    });
    const link = `${process.env['FRONTEND_URL']}/isValid=${token}`;
    try {
      await sendVerificationEmail(user.email, link);
      user.mail_verify_link_sent = true;
    } catch (err) {
      logger.error('Failed to send verification email', err);
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.mobileOtpHash = await bcrypt.hash(otp, 10);
    user.mobileOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    try {
      await sendOtpSms(input.mobile, otp);
    } catch (err) {
      logger.error('Failed to send OTP SMS', err);
    }
  }

  return user.save();
};

export const verifyEmailToken = async (token: string): Promise<boolean> => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new AppError('Server misconfiguration', 500);

  try {
    const payload = jwt.verify(token, secret) as EmailVerifyTokenPayload;
    const user = await User.findById(payload.userId);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    user.mail_verified = true;
    await user.save();
    return true;
  } catch (err) {
    if (err instanceof AppError) throw err;

    const decoded = jwt.decode(token) as EmailVerifyTokenPayload | null;
    if (decoded?.userId) {
      const user = await User.findById(decoded.userId);
      if (user) {
        user.mail_verified = false;
        await user.save();
      }
    }
    return false;
  }
};

export const verifyMobileOtp = async (userId: string, otp: string): Promise<void> => {
  const user = await User.findById(userId).select('+mobileOtpHash +mobileOtpExpiresAt');
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  if (!user.mobileOtpHash || !user.mobileOtpExpiresAt || user.mobileOtpExpiresAt < new Date()) {
    throw new AppError('OTP expired or not requested', 400, 'OTP_EXPIRED');
  }

  const valid = await bcrypt.compare(otp, user.mobileOtpHash);
  if (!valid) throw new AppError('Invalid OTP', 400, 'INVALID_OTP');

  user.mobile_verified = true;
  user.mobileOtpHash = undefined;
  user.mobileOtpExpiresAt = undefined;
  await user.save();
};

export const loginUser = async (email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  const valid = await user.comparePassword(password);
  if (!valid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  if (!user.isActive) throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');

  const userId = (user._id as unknown as { toString(): string }).toString();
  const accessToken = signAccessToken(userId, user.role);
  const refreshToken = signRefreshToken(userId, user.role);

  const ttl = 7 * 24 * 60 * 60;
  await redisClient.set(`refresh:${userId}`, refreshToken, 'EX', ttl);

  return { user, tokens: { accessToken, refreshToken } };
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new AppError('Server misconfiguration', 500);

  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, secret) as JwtPayload;
  } catch {
    throw new AppError('Refresh token invalid or expired', 401, 'UNAUTHORIZED');
  }

  const stored = await redisClient.get(`refresh:${payload.userId}`);
  if (stored !== refreshToken) throw new AppError('Refresh token revoked', 401, 'UNAUTHORIZED');

  return signAccessToken(payload.userId, payload.role);
};

export const logoutUser = async (userId: string): Promise<void> => {
  await redisClient.del(`refresh:${userId}`);
};
