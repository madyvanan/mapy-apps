import { Queue, Worker } from 'bullmq';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

const connection = {
  host: new URL(process.env['REDIS_URL'] ?? 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env['REDIS_URL'] ?? 'redis://localhost:6379').port || '6379', 10),
};

const CART_TTL_MS = 24 * 60 * 60 * 1000;

export const cartCleanupQueue = new Queue('cart-cleanup', { connection });

new Worker(
  'cart-cleanup',
  async () => {
    const result = await prisma.cart.deleteMany({
      where: { updatedAt: { lt: new Date(Date.now() - CART_TTL_MS) } },
    });
    if (result.count > 0) logger.info(`Cart cleanup: removed ${result.count} abandoned cart(s)`);
  },
  { connection },
);

// Replaces the Mongo TTL index (expireAfterSeconds) — Postgres has no equivalent,
// so abandoned carts are swept by this repeatable job instead.
export const scheduleCartCleanup = async (): Promise<void> => {
  await cartCleanupQueue.add('sweep', {}, { repeat: { every: 60 * 60 * 1000 }, jobId: 'cart-cleanup-sweep' });
};
