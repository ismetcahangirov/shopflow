// src/tests/order.test.ts
// Integration tests for /api/orders endpoints

import supertest from 'supertest';

jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  buildOrderConfirmationEmail: jest.fn().mockReturnValue('<html></html>'),
  buildVerifyEmailHtml: jest.fn().mockReturnValue('<html></html>'),
  buildResetPasswordHtml: jest.fn().mockReturnValue('<html></html>'),
}));

import { app } from '../server';
import { prisma } from '../config/db';
import { createTestUser, getBearerToken, TestUser } from './helpers/testHelpers';

const api = supertest(app);

jest.setTimeout(120000);

const TEST_PREFIX = 'order-test';
const ORDER_NUMBER_PREFIX = 'ORD-TEST';
const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const TEST_EMAILS = [
  `admin-order-test-${RUN_ID}@test.com`,
  `customer-order-test-${RUN_ID}@test.com`,
  `other-order-test-${RUN_ID}@test.com`,
];

let adminUser: TestUser;
let customerUser: TestUser;
let otherCustomerUser: TestUser;
let adminToken: string;
let customerToken: string;

function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function cleanupOrderTestData(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { email: { in: TEST_EMAILS } },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);

  const carts = await prisma.cart.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const cartIds = carts.map((cart) => cart.id);

  const categories = await prisma.category.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const categoryIds = categories.map((category) => category.id);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { startsWith: 'SKU-ORDER-' } },
        { categoryId: { in: categoryIds } },
      ],
    },
    select: { id: true },
  });
  const productIds = products.map((product) => product.id);

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { orderNumber: { startsWith: ORDER_NUMBER_PREFIX } },
      ],
    },
    select: { id: true },
  });
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length > 0) {
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
  }
  if (orderIds.length > 0 || productIds.length > 0) {
    await prisma.orderItem.deleteMany({
      where: {
        OR: [
          { orderId: { in: orderIds } },
          { productId: { in: productIds } },
        ],
      },
    });
  }
  if (orderIds.length > 0 || userIds.length > 0) {
    await prisma.order.deleteMany({
      where: {
        OR: [
          { id: { in: orderIds } },
          { userId: { in: userIds } },
        ],
      },
    });
  }
  if (cartIds.length > 0 || productIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: {
        OR: [
          { cartId: { in: cartIds } },
          { productId: { in: productIds } },
        ],
      },
    });
  }
  if (cartIds.length > 0) {
    await prisma.cart.deleteMany({ where: { id: { in: cartIds } } });
  }
  if (userIds.length > 0 || productIds.length > 0) {
    await prisma.review.deleteMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { productId: { in: productIds } },
        ],
      },
    });
    await prisma.wishlistItem.deleteMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { productId: { in: productIds } },
        ],
      },
    });
  }
  if (userIds.length > 0) {
    await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
  }
  await prisma.coupon.deleteMany({ where: { code: { startsWith: 'ORDER' } } });
  if (productIds.length > 0) {
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  }
  if (categoryIds.length > 0) {
    await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
  }
  if (userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
}

async function createAddress(userId: string): Promise<string> {
  const address = await prisma.address.create({
    data: {
      fullName: 'Order Test User',
      phone: '+994501234567',
      city: 'Baki',
      district: 'Nesimi',
      street: 'Order test street 1',
      isDefault: true,
      userId,
    },
    select: { id: true },
  });

  return address.id;
}

async function createProduct(options: {
  stock?: number;
  price?: number;
  isActive?: boolean;
} = {}): Promise<{ id: string; price: number; stock: number }> {
  const marker = uniqueId();
  const category = await prisma.category.create({
    data: {
      name: `Order Test Category ${marker}`,
      slug: `${TEST_PREFIX}-category-${marker}`,
      isActive: true,
    },
    select: { id: true },
  });

  const price = options.price ?? 80;
  const product = await prisma.product.create({
    data: {
      name: `Order Test Product ${marker}`,
      slug: `${TEST_PREFIX}-product-${marker}`,
      description: 'Product used by order integration tests',
      price,
      sku: `SKU-ORDER-${marker}`,
      stock: options.stock ?? 10,
      isActive: options.isActive ?? true,
      categoryId: category.id,
    },
    select: { id: true, price: true, stock: true },
  });

  return {
    id: product.id,
    price: Number(product.price),
    stock: product.stock,
  };
}

async function createCartWithProduct(input: {
  userId: string;
  productId: string;
  quantity: number;
}): Promise<string> {
  const cart = await prisma.cart.upsert({
    where: { userId: input.userId },
    update: {},
    create: { userId: input.userId },
    select: { id: true },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: input.productId,
      quantity: input.quantity,
    },
  });

  return cart.id;
}

async function createOrderFixture(input: {
  userId: string;
  status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  quantity?: number;
  stock?: number;
  productPrice?: number;
}): Promise<{
  id: string;
  orderNumber: string;
  productId: string;
  stockBeforeOrder: number;
  quantity: number;
}> {
  const addressId = await createAddress(input.userId);
  const product = await createProduct({
    stock: input.stock ?? 10,
    price: input.productPrice ?? 80,
  });
  const quantity = input.quantity ?? 2;
  const subtotal = product.price * quantity;
  const shippingCost = subtotal >= 150 ? 0 : 5;
  const orderNumber = `${ORDER_NUMBER_PREFIX}-${uniqueId()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: input.userId,
      addressId,
      subtotal,
      shippingCost,
      discount: 0,
      tax: 0,
      total: subtotal + shippingCost,
      paymentMethod: 'stripe',
      status: input.status ?? 'PENDING',
      paymentStatus: 'UNPAID',
      items: {
        create: {
          productId: product.id,
          productName: 'Order Test Product',
          productSku: `SKU-ORDER-ITEM-${uniqueId()}`,
          quantity,
          price: product.price,
          total: product.price * quantity,
        },
      },
      statusHistory: {
        create: {
          status: input.status ?? 'PENDING',
          note: 'Order test fixture',
        },
      },
    },
    select: { id: true, orderNumber: true },
  });

  await prisma.product.update({
    where: { id: product.id },
    data: { stock: { decrement: quantity } },
  });

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    productId: product.id,
    stockBeforeOrder: product.stock,
    quantity,
  };
}

beforeAll(async () => {
  [adminUser, customerUser, otherCustomerUser] = await Promise.all([
    createTestUser({ email: TEST_EMAILS[0], role: 'ADMIN' }),
    createTestUser({ email: TEST_EMAILS[1], role: 'CUSTOMER' }),
    createTestUser({ email: TEST_EMAILS[2], role: 'CUSTOMER' }),
  ]);

  adminToken = getBearerToken(adminUser);
  customerToken = getBearerToken(customerUser);
});

afterAll(async () => {
  await cleanupOrderTestData();
});

describe('Order API Integration Tests', () => {
  describe('POST /api/orders', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await api.post('/api/orders').send({ addressId: 'address-id' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when addressId is missing', async () => {
      const res = await api
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('returns 404 when address does not exist', async () => {
      const res = await api
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send({ addressId: 'missing-address-id' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('returns 403 when address belongs to another user', async () => {
      const otherAddressId = await createAddress(otherCustomerUser.id);

      const res = await api
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send({ addressId: otherAddressId });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
    });

    it('returns 400 when cart is empty', async () => {
      const addressId = await createAddress(customerUser.id);
      await prisma.cart.deleteMany({ where: { userId: customerUser.id } });

      const res = await api
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send({ addressId });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('EMPTY_CART');
    });

    it('returns 422 when cart product is inactive', async () => {
      const addressId = await createAddress(customerUser.id);
      const product = await createProduct({ isActive: false });
      await createCartWithProduct({ userId: customerUser.id, productId: product.id, quantity: 1 });

      const res = await api
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send({ addressId });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('PRODUCT_UNAVAILABLE');
    });

    it('returns 422 when cart quantity exceeds product stock', async () => {
      const addressId = await createAddress(customerUser.id);
      const product = await createProduct({ stock: 1 });
      await createCartWithProduct({ userId: customerUser.id, productId: product.id, quantity: 2 });

      const res = await api
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send({ addressId });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('OUT_OF_STOCK');
    });

    it('creates an order, deducts stock, and clears the cart', async () => {
      const addressId = await createAddress(customerUser.id);
      const product = await createProduct({ stock: 8, price: 100 });
      await createCartWithProduct({ userId: customerUser.id, productId: product.id, quantity: 2 });

      const res = await api
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send({ addressId, notes: 'Leave at the door' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toMatch(/^ORD-/);
      expect(res.body.data.total).toBe(200);
      expect(res.body.data.status).toBe('PENDING');

      const productAfterOrder = await prisma.product.findUnique({
        where: { id: product.id },
        select: { stock: true },
      });
      const cartAfterOrder = await prisma.cart.findUnique({
        where: { userId: customerUser.id },
        include: { items: true },
      });

      expect(productAfterOrder?.stock).toBe(6);
      expect(cartAfterOrder?.items).toHaveLength(0);
    });

    it('applies a valid coupon discount during order creation', async () => {
      const addressId = await createAddress(customerUser.id);
      const product = await createProduct({ stock: 5, price: 100 });
      const code = `ORDER${uniqueId().replace(/-/g, '').toUpperCase()}`;

      await prisma.coupon.create({
        data: {
          code,
          type: 'PERCENTAGE',
          value: 20,
          minOrderValue: 50,
          maxDiscount: 15,
          isActive: true,
        },
      });
      await createCartWithProduct({ userId: customerUser.id, productId: product.id, quantity: 2 });

      const res = await api
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send({ addressId, couponCode: code });

      expect(res.status).toBe(201);
      expect(res.body.data.discount).toBe(15);
      expect(res.body.data.total).toBe(185);
    });
  });

  describe('GET /api/orders/my', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await api.get('/api/orders/my');

      expect(res.status).toBe(401);
    });

    it('returns only the authenticated customer orders', async () => {
      const customerOrder = await createOrderFixture({ userId: customerUser.id });
      await createOrderFixture({ userId: otherCustomerUser.id });

      const res = await api
        .get('/api/orders/my')
        .set('Authorization', customerToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((order: { id: string }) => order.id === customerOrder.id)).toBe(true);
      expect(res.body.data.every((order: { userId: string }) => order.userId === customerUser.id)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/orders', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await api.get('/api/orders');

      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      const res = await api
        .get('/api/orders')
        .set('Authorization', customerToken);

      expect(res.status).toBe(403);
    });

    it('lists orders for admin with filters and pagination', async () => {
      const order = await createOrderFixture({ userId: customerUser.id, status: 'CONFIRMED' });

      const res = await api
        .get(`/api/orders?status=CONFIRMED&search=${order.orderNumber}&page=1&limit=5`)
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((item: { id: string }) => item.id === order.id)).toBe(true);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('returns 401 when no token is provided', async () => {
      const order = await createOrderFixture({ userId: customerUser.id });

      const res = await api.get(`/api/orders/${order.id}`);

      expect(res.status).toBe(401);
    });

    it('returns 404 when order is not found', async () => {
      const res = await api
        .get('/api/orders/missing-order-id')
        .set('Authorization', customerToken);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('returns 403 when a customer requests another customer order', async () => {
      const order = await createOrderFixture({ userId: otherCustomerUser.id });

      const res = await api
        .get(`/api/orders/${order.id}`)
        .set('Authorization', customerToken);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
    });

    it('returns order detail for owner and admin', async () => {
      const order = await createOrderFixture({ userId: customerUser.id });

      const ownerRes = await api
        .get(`/api/orders/${order.id}`)
        .set('Authorization', customerToken);
      const adminRes = await api
        .get(`/api/orders/${order.id}`)
        .set('Authorization', adminToken);

      expect(ownerRes.status).toBe(200);
      expect(ownerRes.body.data.id).toBe(order.id);
      expect(ownerRes.body.data.items).toHaveLength(1);
      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.id).toBe(order.id);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('returns 401 when no token is provided', async () => {
      const order = await createOrderFixture({ userId: customerUser.id });

      const res = await api
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      const order = await createOrderFixture({ userId: customerUser.id });

      const res = await api
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', customerToken)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(403);
    });

    it('returns 400 for invalid status', async () => {
      const order = await createOrderFixture({ userId: customerUser.id });

      const res = await api
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', adminToken)
        .send({ status: 'REFUNDED' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('returns 404 when order is not found', async () => {
      const res = await api
        .patch('/api/orders/missing-order-id/status')
        .set('Authorization', adminToken)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(404);
    });

    it('updates order status and tracking data as admin', async () => {
      const order = await createOrderFixture({ userId: customerUser.id, status: 'PROCESSING' });

      const res = await api
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', adminToken)
        .send({
          status: 'SHIPPED',
          trackingNumber: 'TRACK-123',
          note: 'Shipped by courier',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SHIPPED');
      expect(res.body.data.trackingNumber).toBe('TRACK-123');
      expect(res.body.data.shippedAt).toBeDefined();

      const historyCount = await prisma.orderStatusHistory.count({
        where: { orderId: order.id, status: 'SHIPPED' },
      });
      expect(historyCount).toBe(1);
    });

    it('restores stock when admin cancels an order by status update', async () => {
      const order = await createOrderFixture({
        userId: customerUser.id,
        status: 'PROCESSING',
        stock: 6,
        quantity: 2,
      });

      const res = await api
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', adminToken)
        .send({ status: 'CANCELLED', note: 'Admin cancelled' });

      const product = await prisma.product.findUnique({
        where: { id: order.productId },
        select: { stock: true },
      });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
      expect(product?.stock).toBe(order.stockBeforeOrder);
    });
  });

  describe('POST /api/orders/:id/cancel', () => {
    it('returns 401 when no token is provided', async () => {
      const order = await createOrderFixture({ userId: customerUser.id });

      const res = await api
        .post(`/api/orders/${order.id}/cancel`)
        .send({ reason: 'No longer needed' });

      expect(res.status).toBe(401);
    });

    it('returns 404 when order is not found', async () => {
      const res = await api
        .post('/api/orders/missing-order-id/cancel')
        .set('Authorization', customerToken)
        .send({ reason: 'No longer needed' });

      expect(res.status).toBe(404);
    });

    it('returns 403 when a customer cancels another customer order', async () => {
      const order = await createOrderFixture({ userId: otherCustomerUser.id });

      const res = await api
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', customerToken)
        .send({ reason: 'No longer needed' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
    });

    it('returns 422 when order is not pending', async () => {
      const order = await createOrderFixture({ userId: customerUser.id, status: 'SHIPPED' });

      const res = await api
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', customerToken)
        .send({ reason: 'Too late' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('CANNOT_CANCEL');
    });

    it('cancels a pending order and restores product stock', async () => {
      const order = await createOrderFixture({
        userId: customerUser.id,
        status: 'PENDING',
        stock: 9,
        quantity: 3,
      });

      const res = await api
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', customerToken)
        .send({ reason: 'Changed my mind' });

      const product = await prisma.product.findUnique({
        where: { id: order.productId },
        select: { stock: true },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CANCELLED');
      expect(res.body.data.cancelReason).toBe('Changed my mind');
      expect(product?.stock).toBe(order.stockBeforeOrder);
    });

    it('allows admin to cancel a customer pending order', async () => {
      const order = await createOrderFixture({ userId: customerUser.id, status: 'PENDING' });

      const res = await api
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', adminToken)
        .send({ reason: 'Admin cancellation' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });
  });
});
