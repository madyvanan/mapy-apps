import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../src/models/User.model';
import { registerUser, loginUser } from '../../src/services/auth.service';

let mongod: MongoMemoryServer;

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    connect: jest.fn().mockResolvedValue(undefined),
  },
}));

beforeAll(async () => {
  process.env['JWT_SECRET'] = 'test-jwt-secret-at-least-32-characters!!';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-at-least-32chars!';
  process.env['JWT_EXPIRES_IN'] = '15m';
  process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});

describe('registerUser', () => {
  it('creates a new user and returns the user document', async () => {
    const user = await registerUser({ name: 'Mathi', email: 'mathi@example.com', password: 'Password123!' });
    expect(user.email).toBe('mathi@example.com');
    expect(user.name).toBe('Mathi');
    expect(user.role).toBe('customer');
  });

  it('throws EMAIL_EXISTS if email already registered', async () => {
    await registerUser({ name: 'Mathi', email: 'mathi@example.com', password: 'Password123!' });
    await expect(
      registerUser({ name: 'Other', email: 'mathi@example.com', password: 'Password123!' }),
    ).rejects.toMatchObject({ code: 'EMAIL_EXISTS' });
  });

  it('accepts an optional role', async () => {
    const user = await registerUser({ name: 'Owner', email: 'owner@example.com', password: 'Pass123!', role: 'restaurant' });
    expect(user.role).toBe('restaurant');
  });
});

describe('loginUser', () => {
  beforeEach(async () => {
    await registerUser({ name: 'Mathi', email: 'mathi@example.com', password: 'Password123!' });
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
