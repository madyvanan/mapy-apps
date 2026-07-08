import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Cart } from '../../src/models/Cart.model';
import { MenuItem } from '../../src/models/MenuItem.model';
import { addItem, getCart, clearCart } from '../../src/services/cart.service';

let mongod: MongoMemoryServer;

const userId = new mongoose.Types.ObjectId().toString();
const restaurantId = new mongoose.Types.ObjectId();
let menuItemId: string;
let menuItem2Id: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const item = await MenuItem.create({
    restaurantId,
    name: 'Dosa',
    description: 'Crispy',
    price: 60,
    category: 'Breakfast',
    isAvailable: true,
    isVeg: true,
    customizations: [],
  });
  menuItemId = (item._id as mongoose.Types.ObjectId).toString();

  const otherRestaurantId = new mongoose.Types.ObjectId();
  const item2 = await MenuItem.create({
    restaurantId: otherRestaurantId,
    name: 'Burger',
    description: 'Juicy',
    price: 120,
    category: 'Fast Food',
    isAvailable: true,
    isVeg: false,
    customizations: [],
  });
  menuItem2Id = (item2._id as mongoose.Types.ObjectId).toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(() => Cart.deleteMany({}));

describe('addItem', () => {
  it('creates a new cart and adds an item', async () => {
    const cart = await addItem(userId, { menuItemId, quantity: 1 });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.name).toBe('Dosa');
    expect(cart.totalAmount).toBe(60);
  });

  it('throws CROSS_RESTAURANT when adding item from different restaurant', async () => {
    await addItem(userId, { menuItemId, quantity: 1 });
    await expect(
      addItem(userId, { menuItemId: menuItem2Id, quantity: 1 }),
    ).rejects.toMatchObject({ code: 'CROSS_RESTAURANT' });
  });

  it('increments quantity when same item added again', async () => {
    await addItem(userId, { menuItemId, quantity: 1 });
    const cart = await addItem(userId, { menuItemId, quantity: 1 });
    expect(cart.items[0]!.quantity).toBe(2);
    expect(cart.totalAmount).toBe(120);
  });
});

describe('getCart', () => {
  it('returns null when no cart exists', async () => {
    const cart = await getCart(new mongoose.Types.ObjectId().toString());
    expect(cart).toBeNull();
  });
});

describe('clearCart', () => {
  it('removes the cart', async () => {
    await addItem(userId, { menuItemId, quantity: 1 });
    await clearCart(userId);
    const cart = await getCart(userId);
    expect(cart).toBeNull();
  });
});
