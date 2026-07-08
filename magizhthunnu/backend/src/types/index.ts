import { Request } from 'express';

export type UserRole = 'customer' | 'restaurant' | 'admin';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;
  error?: ApiError;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentGateway = 'paytm';

export interface OrderEventPayload {
  orderId: string;
  status: OrderStatus;
  estimatedDelivery?: Date;
  deliveryAgent?: string;
  reason?: string;
}

export type OrderEvent =
  | 'order:confirmed'
  | 'order:preparing'
  | 'order:dispatched'
  | 'order:delivered'
  | 'order:new'
  | 'order:cancelled';
