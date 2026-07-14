import { Queue, Worker } from 'bullmq';
import { logger } from '../config/logger';

const connection = {
  host: new URL(process.env['REDIS_URL'] ?? 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env['REDIS_URL'] ?? 'redis://localhost:6379').port || '6379', 10),
};

const defaultJobOptions = { attempts: 5, backoff: { type: 'exponential' as const, delay: 3600000 } };

export const emailQueue = new Queue('email', { connection, defaultJobOptions });

new Worker(
  'email',
  async (job) => {
    await Promise.resolve();
    logger.info(`Processing email job: ${job.name}`, job.data);
    // TODO: integrate SMTP / SendGrid here
  },
  { connection },
);
