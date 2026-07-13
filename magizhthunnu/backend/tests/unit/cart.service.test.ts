import { prisma } from '../../src/config/db';
import { addItem, getCart, clearCart } from '../../src/services/cart.service';

let userId: string;
let menuItemId: string;
let menuItem2Id: string;

beforeAll(async () => {
  const owner = await prisma.user.create({
    data: { name: 'Owner', email: 'owner-cart-test@example.com', passwordHash: 'irrelevant', role: 'restaurant' },
  });
  const customer = await prisma.user.create({
    data: { name: 'Customer', email: 'customer-cart-test@example.com', passwordHash: 'irrelevant', role: 'customer' },
  });
  userId = customer.id;

  const restaurant = await prisma.restaurant.create({
    data: { ownerId: owner.id, name: 'Test Restaurant', street: 'S', city: 'C', state: 'ST', pincode: '000000' },
  });

  const item = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Dosa',
      description: 'Crispy',
      price: 60,
      category: 'Breakfast',
      isAvailable: true,
      isVeg: true,
    },
  });
  menuItemId = item.id;

  const otherOwner = await prisma.user.create({
    data: { name: 'Other Owner', email: 'other-owner-cart-test@example.com', passwordHash: 'irrelevant', role: 'restaurant' },
  });
  const otherRestaurant = await prisma.restaurant.create({
    data: { ownerId: otherOwner.id, name: 'Other Restaurant', street: 'S', city: 'C', state: 'ST', pincode: '000000' },
  });
  const item2 = await prisma.menuItem.create({
    data: {
      restaurantId: otherRestaurant.id,
      name: 'Burger',
      description: 'Juicy',
      price: 120,
      category: 'Fast Food',
      isAvailable: true,
      isVeg: false,
    },
  });
  menuItem2Id = item2.id;
});

afterAll(async () => {
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

afterEach(() => prisma.cart.deleteMany({}));

describe('addItem', () => {
  it('creates a new cart and adds an item', async () => {
    const cart = await addItem(userId, { menuItemId, quantity: 1 });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.name).toBe('Dosa');
    expect(Number(cart.totalAmount)).toBe(60);
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
    expect(Number(cart.totalAmount)).toBe(120);
  });
});

describe('getCart', () => {
  it('returns null when no cart exists', async () => {
    const nobody = await prisma.user.create({
      data: { name: 'Nobody', email: 'nobody-cart-test@example.com', passwordHash: 'irrelevant', role: 'customer' },
    });
    const cart = await getCart(nobody.id);
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
