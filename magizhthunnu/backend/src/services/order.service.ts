import type { Prisma } from '@prisma/client';
import { prisma, isUniqueConstraintError } from '../config/db';
import { AppError } from '../utils/AppError';
import { OrderStatus } from '../types';
import { PaginationOptions, buildPagination } from '../utils/pagination';
import { emitOrderEvent } from './socket.service';

const TAX_RATE = 0.05;

const ORDER_INCLUDE = { lineItems: true } satisfies Prisma.OrderInclude;

export const placeOrder = async (userId: string, deliveryAddressId: string, idempotencyKey: string) => {
  const existing = await prisma.order.findUnique({ where: { idempotencyKey } });
  if (existing) throw new AppError('Duplicate order', 409, 'DUPLICATE_ORDER');

  const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
  if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400, 'EMPTY_CART');

  const address = await prisma.address.findFirst({ where: { id: deliveryAddressId, userId } });
  if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');

  const restaurant = await prisma.restaurant.findUnique({ where: { id: cart.restaurantId } });
  if (!restaurant) throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  if (!restaurant.isOpen) throw new AppError('Restaurant is closed', 400, 'RESTAURANT_CLOSED');

  const subtotal = Number(cart.totalAmount);
  const deliveryFee = Number(restaurant.deliveryFee);
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  const totalAmount = subtotal + deliveryFee + taxes;

  if (totalAmount < Number(restaurant.minOrder)) {
    throw new AppError(`Minimum order is ₹${Number(restaurant.minOrder)}`, 400, 'BELOW_MIN_ORDER');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          restaurantId: cart.restaurantId,
          deliveryStreet: address.street,
          deliveryCity: address.city,
          deliveryState: address.state,
          deliveryPincode: address.pincode,
          deliveryLat: address.lat,
          deliveryLng: address.lng,
          subtotal,
          deliveryFee,
          taxes,
          totalAmount,
          idempotencyKey,
          estimatedDelivery: new Date(Date.now() + restaurant.avgDeliveryTime * 60 * 1000),
          lineItems: {
            create: cart.items.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              customizations: item.customizations as Prisma.InputJsonValue,
              subtotal: item.subtotal,
            })),
          },
        },
        include: ORDER_INCLUDE,
      });

      await tx.cart.delete({ where: { id: cart.id } });

      return order;
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) throw new AppError('Duplicate order', 409, 'DUPLICATE_ORDER');
    throw err;
  }
};

export const getMyOrders = async (userId: string, opts: PaginationOptions) => {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.limit,
      include: ORDER_INCLUDE,
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return { orders, pagination: buildPagination(opts.page, opts.limit, total) };
};

export const getOrderById = async (orderId: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { lineItems: true, restaurant: { select: { name: true, logo: true } } },
  });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

  if (role === 'customer' && order.userId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }
  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  actorId: string,
  actorRole: string,
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

  if (actorRole === 'restaurant') {
    const restaurant = await prisma.restaurant.findFirst({ where: { id: order.restaurantId, ownerId: actorId } });
    if (!restaurant) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status } });

  emitOrderEvent(updated.id, `order:${status === 'out_for_delivery' ? 'dispatched' : status}` as never, {
    orderId: updated.id,
    status,
  });

  return updated;
};

export const cancelOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (['preparing', 'out_for_delivery', 'delivered'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400, 'CANNOT_CANCEL');
  }
  return prisma.order.update({ where: { id: orderId }, data: { status: 'cancelled' } });
};

export const getRestaurantOrders = async (restaurantId: string, opts: PaginationOptions) => {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.limit,
      include: ORDER_INCLUDE,
    }),
    prisma.order.count({ where: { restaurantId } }),
  ]);
  return { orders, pagination: buildPagination(opts.page, opts.limit, total) };
};
