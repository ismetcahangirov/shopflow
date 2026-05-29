// src/tests/cart.test.ts
// Integration tests for /api/cart endpoints

import supertest from 'supertest';
import { app } from '../server';
import { prisma } from '../config/db';
import { createTestUser, getBearerToken, cleanupUsers, TestUser } from './helpers/testHelpers';

const api = supertest(app);

let customerUser: TestUser;
let otherCustomerUser: TestUser;
let customerToken: string;
let otherCustomerToken: string;
let testCategoryId: string;
let testProductId: string;
let outOfStockProductId: string;

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const CUSTOMER_EMAILS = [
  `customer-cart-test-${RUN_ID}@test.com`,
  `other-customer-cart-test-${RUN_ID}@test.com`,
];

async function createTestCategory(): Promise<string> {
  const slug = `test-cat-cart-${Date.now()}`;
  const category = await prisma.category.create({
    data: { name: 'Test Kateqoriya Səbət', slug, isActive: true },
    select: { id: true },
  });
  return category.id;
}

async function createTestProducts(categoryId: string): Promise<{ normalProduct: { id: string }; outOfStockProduct: { id: string } }> {
  const normalProduct = await prisma.product.create({
    data: {
      name: 'Test Cart Product',
      slug: `test-cart-product-${Date.now()}`,
      description: 'Test product for cart integration tests',
      price: 150.00,
      sku: `SKU-CART-${Date.now()}`,
      stock: 10,
      isActive: true,
      categoryId,
    },
  });

  const outOfStockProduct = await prisma.product.create({
    data: {
      name: 'Test OOS Product',
      slug: `test-oos-product-${Date.now()}`,
      description: 'Out of stock product',
      price: 99.99,
      sku: `SKU-CART-OOS-${Date.now()}`,
      stock: 0,
      isActive: true,
      categoryId,
    },
  });

  return { normalProduct, outOfStockProduct };
}

beforeAll(async () => {
  [customerUser, otherCustomerUser] = await Promise.all([
    createTestUser({ email: CUSTOMER_EMAILS[0], role: 'CUSTOMER' }),
    createTestUser({ email: CUSTOMER_EMAILS[1], role: 'CUSTOMER' }),
  ]);

  customerToken = getBearerToken(customerUser);
  otherCustomerToken = getBearerToken(otherCustomerUser);

  testCategoryId = await createTestCategory();
  const products = await createTestProducts(testCategoryId);
  testProductId = products.normalProduct.id;
  outOfStockProductId = products.outOfStockProduct.id;
});

afterAll(async () => {
  const productIds = [testProductId, outOfStockProductId].filter(Boolean);
  const userIds = [customerUser?.id, otherCustomerUser?.id].filter(Boolean);

  // Delete all items & carts created in tests
  if (productIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: {
        productId: { in: productIds },
      },
    });
  }
  if (userIds.length > 0) {
    await prisma.cart.deleteMany({
      where: {
        userId: { in: userIds },
      },
    });
  }
  if (productIds.length > 0) {
    await prisma.product.deleteMany({
      where: {
        id: { in: productIds },
      },
    });
  }
  if (testCategoryId) {
    await prisma.category.delete({
      where: { id: testCategoryId },
    });
  }
  await cleanupUsers(...CUSTOMER_EMAILS);
});

describe('Cart API Integration Tests', () => {
  
  // ── GET /api/cart ──────────────────────────────────────────
  describe('GET /api/cart', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api.get('/api/cart');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return an empty cart shape for a new user (200)', async () => {
      const res = await api
        .get('/api/cart')
        .set('Authorization', customerToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.itemCount).toBe(0);
      expect(res.body.data.subtotal).toBe(0);
      expect(res.body.data.items).toEqual([]);
    });
  });

  // ── POST /api/cart/items ───────────────────────────────────
  describe('POST /api/cart/items', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api
        .post('/api/cart/items')
        .send({ productId: testProductId, quantity: 1 });
      expect(res.status).toBe(401);
    });

    it('should add a product to the cart (200)', async () => {
      const res = await api
        .post('/api/cart/items')
        .set('Authorization', customerToken)
        .send({ productId: testProductId, quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.itemCount).toBe(2);
      expect(res.body.data.subtotal).toBe(300.00);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.items[0].product.id).toBe(testProductId);
    });

    it('should increment quantity when same product is added again', async () => {
      const res = await api
        .post('/api/cart/items')
        .set('Authorization', customerToken)
        .send({ productId: testProductId, quantity: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data.itemCount).toBe(3);
      expect(res.body.data.subtotal).toBe(450.00);
      expect(res.body.data.items[0].quantity).toBe(3);
    });

    it('should return 422 if product is out of stock', async () => {
      const res = await api
        .post('/api/cart/items')
        .set('Authorization', customerToken)
        .send({ productId: outOfStockProductId, quantity: 1 });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('OUT_OF_STOCK');
    });

    it('should return 422 if requested quantity exceeds stock', async () => {
      // Current quantity in cart is 3, product stock is 10. Adding 8 more makes it 11 > 10.
      const res = await api
        .post('/api/cart/items')
        .set('Authorization', customerToken)
        .send({ productId: testProductId, quantity: 8 });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('OUT_OF_STOCK');
    });

    it('should return 404 if product does not exist', async () => {
      const res = await api
        .post('/api/cart/items')
        .set('Authorization', customerToken)
        .send({ productId: 'non-existent-product-id', quantity: 1 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('PRODUCT_NOT_FOUND');
    });

    it('should return 400 for invalid/negative quantity', async () => {
      const res = await api
        .post('/api/cart/items')
        .set('Authorization', customerToken)
        .send({ productId: testProductId, quantity: -2 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  // ── PATCH /api/cart/items/:productId ───────────────────────
  describe('PATCH /api/cart/items/:productId', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api
        .patch(`/api/cart/items/${testProductId}`)
        .send({ quantity: 5 });
      expect(res.status).toBe(401);
    });

    it('should update the quantity of a cart item', async () => {
      const res = await api
        .patch(`/api/cart/items/${testProductId}`)
        .set('Authorization', customerToken)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items[0].quantity).toBe(5);
      expect(res.body.data.subtotal).toBe(750.00);
    });

    it('should return 422 if quantity exceeds stock', async () => {
      const res = await api
        .patch(`/api/cart/items/${testProductId}`)
        .set('Authorization', customerToken)
        .send({ quantity: 15 });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('OUT_OF_STOCK');
    });

    it('should return 404 if item does not exist in the user\'s cart', async () => {
      const res = await api
        .patch(`/api/cart/items/${testProductId}`)
        .set('Authorization', otherCustomerToken)
        .send({ quantity: 1 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('CART_ITEM_NOT_FOUND');
    });

    it('should return 400 for invalid quantity', async () => {
      const res = await api
        .patch(`/api/cart/items/${testProductId}`)
        .set('Authorization', customerToken)
        .send({ quantity: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  // ── DELETE /api/cart/items/:productId ─────────────────────
  describe('DELETE /api/cart/items/:productId', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api.delete(`/api/cart/items/${testProductId}`);
      expect(res.status).toBe(401);
    });

    it('should return 404 if item does not exist in the cart', async () => {
      const res = await api
        .delete(`/api/cart/items/${testProductId}`)
        .set('Authorization', otherCustomerToken);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('CART_ITEM_NOT_FOUND');
    });

    it('should remove the item from the cart', async () => {
      const res = await api
        .delete(`/api/cart/items/${testProductId}`)
        .set('Authorization', customerToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.itemCount).toBe(0);
      expect(res.body.data.subtotal).toBe(0);
    });
  });

  // ── DELETE /api/cart ───────────────────────────────────────
  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
      // Reset cart and add item before each test in this block
      await prisma.cartItem.deleteMany({
        where: {
          productId: testProductId,
        },
      });
      // Find or create cart
      let cart = await prisma.cart.findUnique({
        where: { userId: customerUser.id },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: customerUser.id },
        });
      }
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: testProductId,
          quantity: 2,
        },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await api.delete('/api/cart');
      expect(res.status).toBe(401);
    });

    it('should clear all items from the cart', async () => {
      const res = await api
        .delete('/api/cart')
        .set('Authorization', customerToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.itemCount).toBe(0);
      expect(res.body.data.subtotal).toBe(0);
    });
  });
});
