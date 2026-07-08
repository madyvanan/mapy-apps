import api from './api';
import type { ApiResponse } from '../types';

export const initiatePayment = (data: { orderId: string; idempotencyKey: string }) =>
  api.post<ApiResponse<{ txnToken: string; orderId: string; amount: number }>>('/payments/initiate', data);

export const getPaymentStatus = (id: string) =>
  api.get<ApiResponse<{ status: string; amount: number }>>(`/payments/${id}`);
