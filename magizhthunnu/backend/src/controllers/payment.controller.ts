import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../types';
import * as paymentService from '../services/payment.service';

export const initiate = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { orderId, idempotencyKey } = req.body as { orderId: string; idempotencyKey: string };
  const result = await paymentService.initiatePayment({ orderId, userId: req.user.id, idempotencyKey });
  res.json({ success: true, data: result });
});

export const webhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as Record<string, string>;
  const checksum = (req.headers['x-paytm-checksum'] as string) ?? body['CHECKSUMHASH'] ?? '';
  await paymentService.processWebhook(body, checksum);
  res.json({ success: true });
});

export const getStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const payment = await paymentService.getPaymentStatus(req.params['id'], req.user.id);
  res.json({ success: true, data: payment });
});
