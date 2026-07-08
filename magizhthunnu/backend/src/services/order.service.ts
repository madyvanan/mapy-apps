import { Order, IOrder } from '../models/Order.model';
import { Cart } from '../models/Cart.model';
import { User } from '../models/User.model';
import { Restaurant } from '../models/Restaurant.model';
import { AppError } from '../utils/AppError';
import { OrderStatus } from '../types';
import { PaginationOptions, buildPagination } from '../utils/pagination';
import { emitOrderEvent } from './socket.service';
import * as cartService from './cart.service';

const TAX_RATE = 0.05;

export const placeOrder = async (
  userId: string,
  deliveryAddressId: string,
  idempotencyKey: string,
): Promise<IOrder> => {
  const existing = await Order.findOne({ idempotencyKey });
  if (existing) throw new AppError('Duplicate order', 409, 'DUPLICATE_ORDER');

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400, 'EMPTY_CART');

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  const address = user.addresses.find((a) => a._id.toString() === deliveryAddressId);
  if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');

  const restaurant = await Restaurant.findById(cart.restaurantId);
  if (!restaurant) throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  if (!restaurant.isOpen) throw new AppError('Restaurant is closed', 400, 'RESTAURANT_CLOSED');

  const subtotal = cart.totalAmount;
  const deliveryFee = restaurant.deliveryFee;
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  const totalAmount = subtotal + deliveryFee + taxes;

  if (totalAmount < restaurant.minOrder) {
    throw new AppError(`Minimum order is ₹${restaurant.minOrder}`, 400, 'BELOW_MIN_ORDER');
  }

  const order = await Order.create({
    userId,
    restaurantId: cart.restaurantId,
    items: cart.items,
    deliveryAddress: {
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      coordinates: address.coordinates,
    },
    subtotal,
    deliveryFee,
    taxes,
    totalAmount,
    idempotencyKey,
    estimatedDelivery: new Date(Date.now() + restaurant.avgDeliveryTime * 60 * 1000),
  });

  await cartService.clearCart(userId);
  return order;
};

export const getMyOrders = async (userId: string, opts: PaginationOptions) => {
  const [orders, total] = await Promise.all([
    Order.find({ userId }).sort({ createdAt: -1 }).skip(opts.skip).limit(opts.limit),
    Order.countDocuments({ userId }),
  ]);
  return { orders, pagination: buildPagination(opts.page, opts.limit, total) };
};

export const getOrderById = async (orderId: string, userId: string, role: string): Promise<IOrder> => {
  const order = await Order.findById(orderId).populate('restaurantId', 'name logo');
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

  if (role === 'customer' && order.userId.toString() !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }
  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  actorId: string,
  actorRole: string,
): Promise<IOrder> => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

  if (actorRole === 'restaurant' ) {
    const restaurant = await Restaurant.findOne({ _id: order.restaurantId, ownerId: actorId });
    if (!restaurant) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  order.status = status;
  await order.save();

  emitOrderEvent(order._id.toString(), `order:${status === 'out_for_delivery' ? 'dispatched' : status}` as never, {
    orderId: order._id.toString(),
    status,
  });

  return order;
};

export const cancelOrder = async (orderId: string, userId: string): Promise<IOrder> => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (['preparing', 'out_for_delivery', 'delivered'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400, 'CANNOT_CANCEL');
  }
  order.status = 'cancelled';
  return order.save();
};

export const getRestaurantOrders = async (restaurantId: string, opts: PaginationOptions) => {
  const [orders, total] = await Promise.all([
    Order.find({ restaurantId }).sort({ createdAt: -1 }).skip(opts.skip).limit(opts.limit),
    Order.countDocuments({ restaurantId }),
  ]);
  return { orders, pagination: buildPagination(opts.page, opts.limit, total) };
};
