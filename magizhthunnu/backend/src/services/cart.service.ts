import type { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

interface AddItemInput {
  menuItemId: string;
  quantity: number;
  customizations?: { name: string; option: string; extraPrice: number }[];
}

const CART_INCLUDE = {
  items: { include: { menuItem: { select: { name: true, price: true, image: true } } } },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof CART_INCLUDE }>;

const recalcTotal = async (cartId: string): Promise<Prisma.Decimal | number> => {
  const agg = await prisma.cartItem.aggregate({ where: { cartId }, _sum: { subtotal: true } });
  return agg._sum.subtotal ?? 0;
};

export const getCart = async (userId: string): Promise<CartWithItems | null> => {
  return prisma.cart.findUnique({ where: { userId }, include: CART_INCLUDE });
};

export const addItem = async (userId: string, input: AddItemInput): Promise<CartWithItems> => {
  const menuItem = await prisma.menuItem.findUnique({ where: { id: input.menuItemId } });
  if (!menuItem) throw new AppError('Menu item not found', 404, 'NOT_FOUND');
  if (!menuItem.isAvailable) throw new AppError('Item is not available', 400, 'UNAVAILABLE');

  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (cart && cart.restaurantId !== menuItem.restaurantId) {
    throw new AppError('Cannot add items from different restaurants', 400, 'CROSS_RESTAURANT');
  }

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId, restaurantId: menuItem.restaurantId, totalAmount: 0 } });
  }

  const extraPrice = (input.customizations ?? []).reduce((s, c) => s + c.extraPrice, 0);
  const unitPrice = Number(menuItem.price) + extraPrice;
  const subtotal = unitPrice * input.quantity;

  const existingItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, menuItemId: input.menuItemId } });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + input.quantity,
        subtotal: Number(existingItem.subtotal) + subtotal,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId: input.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: input.quantity,
        customizations: input.customizations ?? [],
        subtotal,
      },
    });
  }

  const totalAmount = await recalcTotal(cart.id);
  return prisma.cart.update({ where: { id: cart.id }, data: { totalAmount }, include: CART_INCLUDE });
};

export const updateItemQty = async (userId: string, menuItemId: string, quantity: number): Promise<CartWithItems> => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError('Cart not found', 404, 'NOT_FOUND');

  const item = await prisma.cartItem.findFirst({ where: { cartId: cart.id, menuItemId } });
  if (!item) throw new AppError('Item not in cart', 404, 'NOT_FOUND');

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    const unitPrice = Number(item.subtotal) / item.quantity;
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity, subtotal: unitPrice * quantity } });
  }

  const totalAmount = await recalcTotal(cart.id);
  return prisma.cart.update({ where: { id: cart.id }, data: { totalAmount }, include: CART_INCLUDE });
};

export const removeItem = async (userId: string, menuItemId: string): Promise<CartWithItems> =>
  updateItemQty(userId, menuItemId, 0);

export const clearCart = async (userId: string): Promise<void> => {
  await prisma.cart.deleteMany({ where: { userId } });
};
