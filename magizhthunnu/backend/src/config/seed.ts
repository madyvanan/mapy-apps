import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db';
import { logger } from './logger';
import { User } from '../models/User.model';

const ADMIN_EMAIL = process.env['SEED_ADMIN_EMAIL'] ?? 'admin@mapyapps.com';
const ADMIN_PASSWORD = process.env['SEED_ADMIN_PASSWORD'] ?? 'test123';

const seedAdmin = async (): Promise<void> => {
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    existing.passwordHash = ADMIN_PASSWORD;
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    logger.info(`Admin account updated: ${ADMIN_EMAIL}`);
    return;
  }

  await User.create({
    name: 'Admin',
    email: ADMIN_EMAIL,
    passwordHash: ADMIN_PASSWORD,
    role: 'admin',
  });
  logger.info(`Admin account created: ${ADMIN_EMAIL}`);
};

const run = async (): Promise<void> => {
  await connectDB();
  await seedAdmin();
  await mongoose.disconnect();
};

run().catch((err) => {
  logger.error('Seeding failed', err);
  process.exit(1);
});