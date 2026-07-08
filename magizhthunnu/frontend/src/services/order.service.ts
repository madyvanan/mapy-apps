import api from './api';
import type { Order, ApiResponse } from '../types';

export const placeOrder = (data: { deliveryAddressId: string; idempotencyKey: string }) =>
  api.post<ApiResponse<Order>>('/orders', data);

export const getMyOrders = (params?: { page?: number; limit?: number }) =>
  api.get<ApiResponse<Order[]>>('/orders/my', { params });

export const getOrderById = (id: string) =>
  api.get<ApiResponse<Order>>(`/orders/${id}`);

export const cancelOrder = (id: string) =>
  api.post<ApiResponse<Order>>(`/orders/${id}/cancel`);

export const updateOrderStatus = (id: string, status: string) =>
  api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
