import { Payment, IPayment } from '../models/Payment.model';
import { Order } from '../models/Order.model';
import { AppError } from '../utils/AppError';
import { emitOrderEvent } from './socket.service';
import { logger } from '../config/logger';
import { emailQueue } from '../queues/email.queue';

interface InitiatePaymentInput {
  orderId: string;
  userId: string;
  idempotencyKey: string;
}

export const initiatePayment = async (input: InitiatePaymentInput): Promise<{ txnToken: string; orderId: string; amount: number }> => {
  const existing = await Payment.findOne({ idempotencyKey: input.idempotencyKey });
  if (existing) {
    return { txnToken: existing.gatewayOrderId ?? '', orderId: input.orderId, amount: existing.amount };
  }

  const order = await Order.findOne({ _id: input.orderId, userId: input.userId });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.paymentStatus === 'paid') throw new AppError('Order already paid', 400, 'ALREADY_PAID');

  await Payment.create({
    orderId: input.orderId,
    userId: input.userId,
    amount: order.totalAmount,
    idempotencyKey: input.idempotencyKey,
    status: 'pending',
  });

  // In production: call Paytm Transaction API here and return real txnToken
  // For now: return a placeholder that will be replaced with real Paytm SDK call
  const txnToken = `TXN_${input.orderId}_${Date.now()}`;

  await Payment.findOneAndUpdate(
    { idempotencyKey: input.idempotencyKey },
    { gatewayOrderId: txnToken },
  );

  return { txnToken, orderId: input.orderId, amount: order.totalAmount };
};

export const processWebhook = async (body: Record<string, string>, checksum: string): Promise<void> => {
  // CRITICAL: Verify Paytm checksum before processing
  // In production: use PaytmChecksum.verifySignature(body, MERCHANT_KEY, checksum)
  const isValid = verifyPaytmChecksum(body, checksum);
  if (!isValid) throw new AppError('Invalid checksum', 400, 'INVALID_CHECKSUM');

  const { ORDERID: orderId, STATUS: status, TXNID: txnId } = body;
  if (!orderId) throw new AppError('Missing order ID', 400, 'BAD_REQUEST');

  const paymentStatus = status === 'TXN_SUCCESS' ? 'paid' : 'failed';
  const orderStatus = status === 'TXN_SUCCESS' ? 'confirmed' : 'pending';

  const [payment] = await Promise.all([
    Payment.findOneAndUpdate(
      { orderId },
      { status: paymentStatus, gatewayPaymentId: txnId, metadata: body },
      { new: true },
    ),
    Order.findByIdAndUpdate(orderId, { paymentStatus, ...(paymentStatus === 'paid' && { status: orderStatus }) }),
  ]);

  if (payment && paymentStatus === 'paid') {
    emitOrderEvent(orderId, 'order:confirmed', { orderId, status: 'confirmed' });
    await emailQueue.add('order-confirmation', { orderId, userId: payment.userId.toString() });
    logger.info(`Payment confirmed for order ${orderId}`);
  }
};

export const getPaymentStatus = async (paymentId: string, userId: string): Promise<IPayment> => {
  const payment = await Payment.findOne({ _id: paymentId, userId });
  if (!payment) throw new AppError('Payment not found', 404, 'NOT_FOUND');
  return payment;
};

// Placeholder — replace with: PaytmChecksum.verifySignature(body, process.env.PAYTM_MERCHANT_KEY, checksum)
const verifyPaytmChecksum = (_body: Record<string, string>, _checksum: string): boolean => {
  if (process.env['NODE_ENV'] === 'test') return true;
  logger.warn('Paytm checksum verification uses placeholder — integrate real SDK in production');
  return true;
};
