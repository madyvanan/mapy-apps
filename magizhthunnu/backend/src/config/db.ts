import mongoose from 'mongoose';
import { logger } from './logger';

export const connectDB = async (): Promise<void> => {
  const uri = process.env['MONGODB_URI'];
  if (!uri) throw new Error('MONGODB_URI is not defined');

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info('MongoDB connected');
      return;
    } catch (err) {
      attempt++;
      logger.error(`MongoDB connection attempt ${attempt} failed`, err);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
};

mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
