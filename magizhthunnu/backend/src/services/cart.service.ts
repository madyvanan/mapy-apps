import mongoose from 'mongoose';
import { Cart, ICart } from '../models/Cart.model';
import { MenuItem } from '../models/MenuItem.model';
import { AppError } from '../utils/AppError';

interface AddItemInput {
  menuItemId: string;
  quantity: number;
  customizations?: { name: string; option: string; extraPrice: number }[];
}

const recalcTotal = (cart: ICart): void => {
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
};

export const getCart = async (userId: string): Promise<ICart | null> => {
  return Cart.findOne({ userId }).populate('items.menuItemId', 'name price image');
};

export const addItem = async (userId: string, input: AddItemInput): Promise<ICart> => {
  const menuItem = await MenuItem.findById(input.menuItemId);
  if (!menuItem) throw new AppError('Menu item not found', 404, 'NOT_FOUND');
  if (!menuItem.isAvailable) throw new AppError('Item is not available', 400, 'UNAVAILABLE');

  const restaurantId = menuItem.restaurantId;
  let cart = await Cart.findOne({ userId });

  if (cart && cart.restaurantId.toString() !== restaurantId.toString()) {
    throw new AppError('Cannot add items from different restaurants', 400, 'CROSS_RESTAURANT');
  }

  if (!cart) {
    cart = new Cart({ userId, restaurantId, items: [], totalAmount: 0 });
  }

  const extraPrice = (input.customizations ?? []).reduce((s, c) => s + c.extraPrice, 0);
  const unitPrice = menuItem.price + extraPrice;
  const subtotal = unitPrice * input.quantity;

  const existingIdx = cart.items.findIndex(
    (i) => i.menuItemId.toString() === input.menuItemId,
  );

  if (existingIdx >= 0) {
    cart.items[existingIdx]!.quantity += input.quantity;
    cart.items[existingIdx]!.subtotal += subtotal;
  } else {
    cart.items.push({
      menuItemId: new mongoose.Types.ObjectId(input.menuItemId),
      name: menuItem.name,
      price: menuItem.price,
      quantity: input.quantity,
      customizations: input.customizations ?? [],
      subtotal,
    });
  }

  recalcTotal(cart);
  return cart.save();
};

export const updateItemQty = async (
  userId: string,
  menuItemId: string,
  quantity: number,
): Promise<ICart> => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError('Cart not found', 404, 'NOT_FOUND');

  const idx = cart.items.findIndex((i) => i.menuItemId.toString() === menuItemId);
  if (idx < 0) throw new AppError('Item not in cart', 404, 'NOT_FOUND');

  if (quantity <= 0) {
    cart.items.splice(idx, 1);
  } else {
    const item = cart.items[idx]!;
    const unitPrice = item.subtotal / item.quantity;
    item.quantity = quantity;
    item.subtotal = unitPrice * quantity;
  }

  recalcTotal(cart);
  return cart.save();
};

export const removeItem = async (userId: string, menuItemId: string): Promise<ICart> => {
  return updateItemQty(userId, menuItemId, 0);
};

export const clearCart = async (userId: string): Promise<void> => {
  await Cart.deleteOne({ userId });
};
