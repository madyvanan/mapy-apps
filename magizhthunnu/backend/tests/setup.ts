import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export default async function setup() {
  mongod = await MongoMemoryServer.create();
  process.env['MONGODB_URI'] = mongod.getUri();
  process.env['JWT_SECRET'] = 'test-jwt-secret-32chars-minimum!!';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-32chars-min!!';
  process.env['NODE_ENV'] = 'test';
  await mongoose.connect(mongod.getUri());
  (global as Record<string, unknown>).__MONGOD__ = mongod;
}
