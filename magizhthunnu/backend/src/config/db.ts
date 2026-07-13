import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from './logger';

const BCRYPT_COST = 12;

const client = new PrismaClient({
  omit: {
    user: {
      passwordHash: true,
      mobileOtpHash: true,
      mobileOtpExpiresAt: true,
    },
  },
});

export const prisma = client.$extends({
  query: {
    user: {
      async create({ args, query }) {
        if (typeof args.data.passwordHash === 'string') {
          args.data.passwordHash = await bcrypt.hash(args.data.passwordHash, BCRYPT_COST);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (typeof args.data.passwordHash === 'string') {
          args.data.passwordHash = await bcrypt.hash(args.data.passwordHash, BCRYPT_COST);
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (typeof args.create.passwordHash === 'string') {
          args.create.passwordHash = await bcrypt.hash(args.create.passwordHash, BCRYPT_COST);
        }
        if (typeof args.update.passwordHash === 'string') {
          args.update.passwordHash = await bcrypt.hash(args.update.passwordHash, BCRYPT_COST);
        }
        return query(args);
      },
    },
  },
});

export const comparePassword = (candidate: string, hash: string): Promise<boolean> =>
  bcrypt.compare(candidate, hash);

export const isNotFoundError = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025';

export const isUniqueConstraintError = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';

export const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await prisma.$connect();
      logger.info('PostgreSQL connected');
      return;
    } catch (err) {
      attempt++;
      logger.error(`PostgreSQL connection attempt ${attempt} failed`, err);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
};
