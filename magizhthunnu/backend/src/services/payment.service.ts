import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import { emitOrderEvent } from './socket.service';
import { logger } from '../config/logger';
import { emailQueue } from '../queues/email.queue';

interface InitiatePaymentInput {
  orderId: string;
  userId: string;
  idempotencyKey: string;
}

export const initiatePayment = async (
  input: InitiatePaymentInput,
): Promise<{ txnToken: string; orderId: string; amount: number }> => {
  const existing = await prisma.payment.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) {
    return { txnToken: existing.gatewayOrderId ?? '', orderId: input.orderId, amount: Number(existing.amount) };
  }

  const order = await prisma.order.findFirst({ where: { id: input.orderId, userId: input.userId } });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.paymentStatus === 'paid') throw new AppError('Order already paid', 400, 'ALREADY_PAID');

  await prisma.payment.create({
    data: {
      orderId: input.orderId,
      userId: input.userId,
      amount: order.totalAmount,
      idempotencyKey: input.idempotencyKey,
      status: 'pending',
    },
  });

  // In production: call Paytm Transaction API here and return real txnToken
  // For now: return a placeholder that will be replaced with real Paytm SDK call
  const txnToken = `TXN_${input.orderId}_${Date.now()}`;

  await prisma.payment.update({
    where: { idempotencyKey: input.idempotencyKey },
    data: { gatewayOrderId: txnToken },
  });

  return { txnToken, orderId: input.orderId, amount: Number(order.totalAmount) };
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

  const [payment] = await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: paymentStatus, gatewayPaymentId: txnId, metadata: body },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus, ...(paymentStatus === 'paid' && { status: orderStatus }) },
    }),
  ]);

  if (payment && paymentStatus === 'paid') {
    emitOrderEvent(orderId, 'order:confirmed', { orderId, status: 'confirmed' });
    await emailQueue.add('order-confirmation', { orderId, userId: payment.userId });
    logger.info(`Payment confirmed for order ${orderId}`);
  }
};

export const getPaymentStatus = async (paymentId: string, userId: string) => {
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, userId } });
  if (!payment) throw new AppError('Payment not found', 404, 'NOT_FOUND');
  return payment;
};

// Placeholder — replace with: PaytmChecksum.verifySignature(body, process.env.PAYTM_MERCHANT_KEY, checksum)
const verifyPaytmChecksum = (_body: Record<string, string>, _checksum: string): boolean => {
  if (process.env['NODE_ENV'] === 'test') return true;
  logger.warn('Paytm checksum verification uses placeholder — integrate real SDK in production');
  return true;
};
