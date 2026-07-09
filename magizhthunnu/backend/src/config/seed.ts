import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db';
import { logger } from './logger';
import { User } from '../models/User.model';
import { Restaurant } from '../models/Restaurant.model';

const ADMIN_EMAIL = process.env['SEED_ADMIN_EMAIL'] ?? 'admin@mapyapps.com';
const ADMIN_PASSWORD = process.env['SEED_ADMIN_PASSWORD'] ?? 'test123';

const RESTAURANT_EMAIL = process.env['SEED_RESTAURANT_EMAIL'] ?? 'rest@mapyapps.com';
const RESTAURANT_PASSWORD = process.env['SEED_RESTAURANT_PASSWORD'] ?? 'test123';

const CUSTOMER_EMAIL = process.env['SEED_CUSTOMER_EMAIL'] ?? 'cust@mapyapps.com';
const CUSTOMER_PASSWORD = process.env['SEED_CUSTOMER_PASSWORD'] ?? 'test123';

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

const seedRestaurantOwner = async (): Promise<void> => {
  let owner = await User.findOne({ email: RESTAURANT_EMAIL });
  if (owner) {
    owner.passwordHash = RESTAURANT_PASSWORD;
    owner.role = 'restaurant';
    owner.isActive = true;
    await owner.save();
    logger.info(`Restaurant account updated: ${RESTAURANT_EMAIL}`);
  } else {
    owner = await User.create({
      name: 'Default Restaurant Owner',
      email: RESTAURANT_EMAIL,
      passwordHash: RESTAURANT_PASSWORD,
      role: 'restaurant',
    });
    logger.info(`Restaurant account created: ${RESTAURANT_EMAIL}`);
  }

  const existingRestaurant = await Restaurant.findOne({ ownerId: owner._id });
  if (!existingRestaurant) {
    await Restaurant.create({
      ownerId: owner._id,
      name: 'Default Restaurant',
      description: 'Seeded default restaurant for testing',
      cuisineTypes: ['Multi-cuisine'],
      address: {
        street: '1 Test Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
      },
      isOpen: true,
      isVerified: true,
    });
    logger.info(`Default restaurant created for owner: ${RESTAURANT_EMAIL}`);
  }
};

const seedCustomer = async (): Promise<void> => {
  const existing = await User.findOne({ email: CUSTOMER_EMAIL });
  if (existing) {
    existing.passwordHash = CUSTOMER_PASSWORD;
    existing.role = 'customer';
    existing.isActive = true;
    await existing.save();
    logger.info(`Customer account updated: ${CUSTOMER_EMAIL}`);
    return;
  }

  await User.create({
    name: 'Default Customer',
    email: CUSTOMER_EMAIL,
    passwordHash: CUSTOMER_PASSWORD,
    role: 'customer',
  });
  logger.info(`Customer account created: ${CUSTOMER_EMAIL}`);
};

const run = async (): Promise<void> => {
  await connectDB();
  await seedAdmin();
  await seedRestaurantOwner();
  await seedCustomer();
  await mongoose.disconnect();
};

run().catch((err) => {
  logger.error('Seeding failed', err);
  process.exit(1);
});