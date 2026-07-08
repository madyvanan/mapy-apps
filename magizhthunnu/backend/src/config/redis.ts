import Redis from 'ioredis';
import { logger } from './logger';

const createRedisClient = (): Redis => {
  const url = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
  const client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 });
  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) => logger.error('Redis error', err));
  return client;
};

export const redisClient = createRedisClient();
export const redisSub = createRedisClient();
