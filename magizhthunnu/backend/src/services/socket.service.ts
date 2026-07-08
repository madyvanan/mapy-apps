import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { redisClient, redisSub } from '../config/redis';
import { logger } from '../config/logger';
import { OrderEvent, OrderEventPayload } from '../types';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? [],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on('join:order', ({ orderId }: { orderId: string }) => {
      void socket.join(`order:${orderId}`);
    });

    socket.on('join:restaurant', ({ restaurantId }: { restaurantId: string }) => {
      void socket.join(`restaurant:${restaurantId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  void redisSub.subscribe('order-events', (err) => {
    if (err) logger.error('Redis subscription error', err);
  });

  redisSub.on('message', (_channel: string, message: string) => {
    const { orderId, event, payload } = JSON.parse(message) as {
      orderId: string;
      event: OrderEvent;
      payload: OrderEventPayload;
    };
    if (io) {
      io.to(`order:${orderId}`).emit(event, payload);
      io.to(`restaurant:${payload.orderId}`).emit(event, payload);
    }
  });

  return io;
};

export const emitOrderEvent = (
  orderId: string,
  event: OrderEvent,
  payload: OrderEventPayload,
): void => {
  void redisClient.publish('order-events', JSON.stringify({ orderId, event, payload }));
};
