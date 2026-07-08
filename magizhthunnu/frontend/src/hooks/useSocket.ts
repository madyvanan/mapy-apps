import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { OrderStatus } from '../types';

interface OrderEvent {
  orderId: string;
  status: OrderStatus;
  estimatedDelivery?: string;
  deliveryAgent?: string;
}

export const useOrderSocket = (orderId: string | null, onUpdate: (event: OrderEvent) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const socket = io(import.meta.env['VITE_SOCKET_URL'] as string ?? 'http://localhost:5000', {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.emit('join:order', { orderId });

    const events = ['order:confirmed', 'order:preparing', 'order:dispatched', 'order:delivered', 'order:cancelled'] as const;
    events.forEach((event) => {
      socket.on(event, (payload: OrderEvent) => onUpdate(payload));
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, onUpdate]);

  return socketRef;
};

export const useRestaurantSocket = (restaurantId: string | null, onNewOrder: (order: unknown) => void) => {
  useEffect(() => {
    if (!restaurantId) return;

    const socket = io(import.meta.env['VITE_SOCKET_URL'] as string ?? 'http://localhost:5000', {
      withCredentials: true,
    });

    socket.emit('join:restaurant', { restaurantId });
    socket.on('order:new', onNewOrder);

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, onNewOrder]);
};
