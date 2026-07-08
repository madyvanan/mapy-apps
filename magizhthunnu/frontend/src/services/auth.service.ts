import api from './api';
import type { User, ApiResponse } from '../types';

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  mailVerificationRequired: boolean;
  mobileVerificationRequired: boolean;
}

export const register = (data: { name: string; email: string; password: string; mobile: string; role?: string }) =>
  api.post<ApiResponse<RegisterResponse>>('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post<ApiResponse<User>>('/auth/login', data);

export const logout = () => api.post<ApiResponse>('/auth/logout');

export const getMe = () => api.get<ApiResponse<User>>('/auth/me');

export const verifyEmail = (token: string) =>
  api.get<ApiResponse<{ verified: boolean }>>(`/auth/isValid=${encodeURIComponent(token)}`);

export const verifyMobileOtp = (userId: string, otp: string) =>
  api.post<ApiResponse>('/auth/verify-mobile-otp', { userId, otp });
