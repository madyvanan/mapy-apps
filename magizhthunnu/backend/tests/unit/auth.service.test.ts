import { prisma } from '../../src/config/db';
import { registerUser, loginUser } from '../../src/services/auth.service';

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    connect: jest.fn().mockResolvedValue(undefined),
  },
}));

beforeAll(() => {
  process.env['JWT_EXPIRES_IN'] = '15m';
  process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.user.deleteMany({});
  jest.clearAllMocks();
});

describe('registerUser', () => {
  it('creates a new user and returns the user record', async () => {
    const user = await registerUser({ name: 'Mathi', email: 'mathi@example.com', password: 'Password123!', mobile: '9876543210' });
    expect(user.email).toBe('mathi@example.com');
    expect(user.name).toBe('Mathi');
    expect(user.role).toBe('customer');
  });

  it('throws EMAIL_EXISTS if email already registered', async () => {
    await registerUser({ name: 'Mathi', email: 'mathi@example.com', password: 'Password123!', mobile: '9876543210' });
    await expect(
      registerUser({ name: 'Other', email: 'mathi@example.com', password: 'Password123!', mobile: '9876543211' }),
    ).rejects.toMatchObject({ code: 'EMAIL_EXISTS' });
  });

  it('accepts an optional role', async () => {
    const user = await registerUser({ name: 'Owner', email: 'owner@example.com', password: 'Pass123!', mobile: '9876543212', role: 'restaurant' });
    expect(user.role).toBe('restaurant');
  });
});

describe('loginUser', () => {
  beforeEach(async () => {
    await registerUser({ name: 'Mathi', email: 'mathi@example.com', password: 'Password123!', mobile: '9876543210' });
  });

  it('returns user and tokens on valid credentials', async () => {
    const result = await loginUser('mathi@example.com', 'Password123!');
    expect(result.user.email).toBe('mathi@example.com');
    expect(result.tokens.accessToken).toBeTruthy();
    expect(result.tokens.refreshToken).toBeTruthy();
  });

  it('throws INVALID_CREDENTIALS on wrong password', async () => {
    await expect(loginUser('mathi@example.com', 'wrongpass')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('throws INVALID_CREDENTIALS on unknown email', async () => {
    await expect(loginUser('unknown@example.com', 'Password123!')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });
});
