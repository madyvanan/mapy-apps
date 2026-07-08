import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    connect: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(),
    on: jest.fn(),
  },
  redisSub: {
    subscribe: jest.fn(),
    on: jest.fn(),
  },
}));

jest.mock('../../src/services/socket.service', () => ({
  initSocket: jest.fn(),
  emitOrderEvent: jest.fn(),
}));

jest.mock('../../src/config/db', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

// Import app AFTER mocks are set up
import { app } from '../../src/server';
import { User } from '../../src/models/User.model';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  process.env['JWT_SECRET'] = 'test-jwt-secret-at-least-32-characters!!';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-at-least-32chars!';
  process.env['NODE_ENV'] = 'test';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(() => User.deleteMany({}));

describe('POST /api/auth/register', () => {
  it('registers a user and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Mathi', email: 'mathi@test.com', password: 'Password123!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('mathi@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 400 on missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@x.com', password: 'Password123!' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 on duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ name: 'A', email: 'dup@test.com', password: 'Password123!' });
    const res = await request(app).post('/api/auth/register').send({ name: 'B', email: 'dup@test.com', password: 'Password123!' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Mathi', email: 'mathi@test.com', password: 'Password123!' });
  });

  it('logs in with valid credentials and sets cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mathi@test.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('mathi@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mathi@test.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without auth cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
