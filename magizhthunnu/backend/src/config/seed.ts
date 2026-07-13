import 'dotenv/config';
import { connectDB, prisma } from './db';
import { logger } from './logger';

const ADMIN_EMAIL = process.env['SEED_ADMIN_EMAIL'] ?? 'admin@mapyapps.com';
const ADMIN_PASSWORD = process.env['SEED_ADMIN_PASSWORD'] ?? 'test123';

const RESTAURANT_EMAIL = process.env['SEED_RESTAURANT_EMAIL'] ?? 'rest@mapyapps.com';
const RESTAURANT_PASSWORD = process.env['SEED_RESTAURANT_PASSWORD'] ?? 'test123';

const CUSTOMER_EMAIL = process.env['SEED_CUSTOMER_EMAIL'] ?? 'cust@mapyapps.com';
const CUSTOMER_PASSWORD = process.env['SEED_CUSTOMER_PASSWORD'] ?? 'test123';

const seedAdmin = async (): Promise<void> => {
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: ADMIN_PASSWORD, role: 'admin', isActive: true },
    create: { name: 'Admin', email: ADMIN_EMAIL, passwordHash: ADMIN_PASSWORD, role: 'admin' },
  });
  logger.info(`Admin account seeded: ${ADMIN_EMAIL}`);
};

const seedRestaurantOwner = async (): Promise<void> => {
  const owner = await prisma.user.upsert({
    where: { email: RESTAURANT_EMAIL },
    update: { passwordHash: RESTAURANT_PASSWORD, role: 'restaurant', isActive: true },
    create: { name: 'Default Restaurant Owner', email: RESTAURANT_EMAIL, passwordHash: RESTAURANT_PASSWORD, role: 'restaurant' },
  });
  logger.info(`Restaurant account seeded: ${RESTAURANT_EMAIL}`);

  const existingRestaurant = await prisma.restaurant.findFirst({ where: { ownerId: owner.id } });
  if (existingRestaurant) return;

  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: 'Default Restaurant',
      description: 'Seeded default restaurant for testing',
      cuisineTypes: ['Multi-cuisine'],
      street: '1 Test Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      isOpen: true,
      isVerified: true,
    },
  });

  // location is Unsupported("geography") in schema.prisma — Prisma Client can't write it, so it's
  // set via a follow-up raw SQL statement. Default to Chennai city-center coordinates.
  await prisma.$executeRaw`
    UPDATE restaurant
    SET location = ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geography
    WHERE id = ${restaurant.id}::uuid`;

  logger.info(`Default restaurant seeded for owner: ${RESTAURANT_EMAIL}`);
};

const seedCustomer = async (): Promise<void> => {
  await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: { passwordHash: CUSTOMER_PASSWORD, role: 'customer', isActive: true },
    create: { name: 'Default Customer', email: CUSTOMER_EMAIL, passwordHash: CUSTOMER_PASSWORD, role: 'customer' },
  });
  logger.info(`Customer account seeded: ${CUSTOMER_EMAIL}`);
};

const run = async (): Promise<void> => {
  await connectDB();
  await seedAdmin();
  await seedRestaurantOwner();
  await seedCustomer();
  await prisma.$disconnect();
};

run().catch(async (err) => {
  logger.error('Seeding failed', err);
  await prisma.$disconnect();
  process.exit(1);
});
