// src/tests/review.test.ts
// Integration tests for /api/reviews endpoints

import request from 'supertest';
import { app } from '../server';
import { prisma } from '../config/db';
import { cleanupUsers, createTestUser, getBearerToken, TestUser } from './helpers/testHelpers';

jest.setTimeout(120000);

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const TEST_PREFIX = `review-test-${RUN_ID}`;
const TEST_EMAILS = [
  `admin-${TEST_PREFIX}@test.com`,
  `customer-${TEST_PREFIX}@test.com`,
  `other-${TEST_PREFIX}@test.com`,
];

let adminUser: TestUser;
let customerUser: TestUser;
let otherCustomerUser: TestUser;
let adminToken: string;
let customerToken: string;
let otherCustomerToken: string;

function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function createProduct(options: { isActive?: boolean } = {}): Promise<{ id: string }> {
  const marker = uniqueId();
  const category = await prisma.category.create({
    data: {
      name: `Review Test Category ${marker}`,
      slug: `${TEST_PREFIX}-category-${marker}`,
      isActive: true,
    },
    select: { id: true },
  });

  return prisma.product.create({
    data: {
      name: `Review Test Product ${marker}`,
      slug: `${TEST_PREFIX}-product-${marker}`,
      description: 'Product used by review integration tests',
      price: 120,
      sku: `SKU-REVIEW-${marker}`,
      stock: 10,
      isActive: options.isActive ?? true,
      categoryId: category.id,
    },
    select: { id: true },
  });
}

async function createAddress(userId: string): Promise<string> {
  const address = await prisma.address.create({
    data: {
      fullName: 'Review Test User',
      phone: '+994501234567',
      city: 'Baki',
      district: 'Nesimi',
      street: 'Review test street 1',
      userId,
    },
    select: { id: true },
  });

  return address.id;
}

async function createPurchasedOrder(input: {
  userId: string;
  productId: string;
  status: 'SHIPPED' | 'DELIVERED';
}): Promise<void> {
  const addressId = await createAddress(input.userId);
  const orderNumber = `ORD-REVIEW-${uniqueId()}`;

  await prisma.order.create({
    data: {
      orderNumber,
      userId: input.userId,
      addressId,
      subtotal: 120,
      shippingCost: 0,
      discount: 0,
      tax: 0,
      total: 120,
      paymentMethod: 'stripe',
      status: input.status,
      paymentStatus: 'PAID',
      items: {
        create: {
          productId: input.productId,
          productName: 'Review Test Product',
          productSku: `SKU-REVIEW-ORDER-${uniqueId()}`,
          quantity: 1,
          price: 120,
          total: 120,
        },
      },
      statusHistory: {
        create: {
          status: input.status,
          note: 'Review test purchase fixture',
        },
      },
    },
  });
}

async function createReview(input: {
  userId: string;
  productId: string;
  rating: number;
  isApproved?: boolean;
  body?: string;
}): Promise<{ id: string }> {
  return prisma.review.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      rating: input.rating,
      title: 'Review Test Title',
      body: input.body ?? 'Review test body',
      isApproved: input.isApproved ?? false,
    },
    select: { id: true },
  });
}

async function cleanupReviewTestData(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { email: { in: TEST_EMAILS } },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);

  const categories = await prisma.category.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const categoryIds = categories.map((category) => category.id);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { startsWith: 'SKU-REVIEW-' } },
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
        { orderNumber: { startsWith: 'ORD-REVIEW-' } },
      ],
    },
    select: { id: true },
  });
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length > 0) {
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
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
    await prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } });
  }
  if (userIds.length > 0) {
    await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
    await cleanupUsers(...TEST_EMAILS);
  }
  if (productIds.length > 0) {
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  }
  if (categoryIds.length > 0) {
    await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
  }
}

beforeAll(async () => {
  [adminUser, customerUser, otherCustomerUser] = await Promise.all([
    createTestUser({ email: TEST_EMAILS[0], role: 'ADMIN' }),
    createTestUser({ email: TEST_EMAILS[1], role: 'CUSTOMER' }),
    createTestUser({ email: TEST_EMAILS[2], role: 'CUSTOMER' }),
  ]);

  adminToken = getBearerToken(adminUser);
  customerToken = getBearerToken(customerUser);
  otherCustomerToken = getBearerToken(otherCustomerUser);
});

afterAll(async () => {
  await cleanupReviewTestData();
});

describe('Review API Integration Tests', () => {
  describe('GET /api/reviews', () => {
    it('returns only approved reviews publicly', async () => {
      const product = await createProduct();
      const approved = await createReview({
        userId: customerUser.id,
        productId: product.id,
        rating: 5,
        isApproved: true,
      });
      const pending = await createReview({
        userId: otherCustomerUser.id,
        productId: product.id,
        rating: 2,
        isApproved: false,
      });

      const res = await request(app).get(`/api/reviews?productId=${product.id}`);
      const ids = (res.body.data as Array<{ id: string }>).map((review) => review.id);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(ids).toContain(approved.id);
      expect(ids).not.toContain(pending.id);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('supports pagination query for approved reviews', async () => {
      const product = await createProduct();
      await createReview({ userId: customerUser.id, productId: product.id, rating: 4, isApproved: true });

      const res = await request(app).get(`/api/reviews?productId=${product.id}&page=1&limit=1`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/reviews', () => {
    it('returns 401 when no token is provided', async () => {
      const product = await createProduct();

      const res = await request(app)
        .post('/api/reviews')
        .send({ productId: product.id, rating: 5, body: 'Great product' });

      expect(res.status).toBe(401);
    });

    it('returns 400 when validation fails', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', customerToken)
        .send({ rating: 6, body: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('returns 404 when product does not exist', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', customerToken)
        .send({ productId: 'missing-product-id', rating: 5, body: 'Great product' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('returns 404 when product is inactive', async () => {
      const product = await createProduct({ isActive: false });

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', customerToken)
        .send({ productId: product.id, rating: 5, body: 'Great product' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('creates a pending unverified review for a customer', async () => {
      const product = await createProduct();

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', customerToken)
        .send({
          productId: product.id,
          rating: 4,
          title: 'Solid',
          body: 'A useful product for testing reviews',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe(product.id);
      expect(res.body.data.isApproved).toBe(false);
      expect(res.body.data.isVerified).toBe(false);
    });

    it('marks review as verified when customer purchased the product', async () => {
      const product = await createProduct();
      await createPurchasedOrder({
        userId: customerUser.id,
        productId: product.id,
        status: 'DELIVERED',
      });

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', customerToken)
        .send({
          productId: product.id,
          rating: 5,
          body: 'Purchased and loved it',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.isVerified).toBe(true);
    });

    it('returns 409 when customer reviews same product twice', async () => {
      const product = await createProduct();
      await createReview({
        userId: customerUser.id,
        productId: product.id,
        rating: 3,
      });

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', customerToken)
        .send({
          productId: product.id,
          rating: 4,
          body: 'Second review should fail',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('ALREADY_REVIEWED');
    });
  });

  describe('PATCH /api/reviews/:id/approve', () => {
    it('returns 401 when no token is provided', async () => {
      const product = await createProduct();
      const review = await createReview({ userId: customerUser.id, productId: product.id, rating: 5 });

      const res = await request(app)
        .patch(`/api/reviews/${review.id}/approve`)
        .send({ isApproved: true });

      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      const product = await createProduct();
      const review = await createReview({ userId: customerUser.id, productId: product.id, rating: 5 });

      const res = await request(app)
        .patch(`/api/reviews/${review.id}/approve`)
        .set('Authorization', customerToken)
        .send({ isApproved: true });

      expect(res.status).toBe(403);
    });

    it('returns 404 when review is not found', async () => {
      const res = await request(app)
        .patch('/api/reviews/missing-review-id/approve')
        .set('Authorization', adminToken)
        .send({ isApproved: true });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('approves review and updates product rating stats', async () => {
      const product = await createProduct();
      const review = await createReview({
        userId: customerUser.id,
        productId: product.id,
        rating: 5,
        isApproved: false,
      });

      const res = await request(app)
        .patch(`/api/reviews/${review.id}/approve`)
        .set('Authorization', adminToken)
        .send({ isApproved: true });

      const productAfterApprove = await prisma.product.findUnique({
        where: { id: product.id },
        select: { avgRating: true, reviewCount: true },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(productAfterApprove?.avgRating).toBe(5);
      expect(productAfterApprove?.reviewCount).toBe(1);
    });

    it('rejects review and recalculates product rating stats', async () => {
      const product = await createProduct();
      const review = await createReview({
        userId: customerUser.id,
        productId: product.id,
        rating: 3,
        isApproved: true,
      });

      const res = await request(app)
        .patch(`/api/reviews/${review.id}/approve`)
        .set('Authorization', adminToken)
        .send({ isApproved: false });

      const productAfterReject = await prisma.product.findUnique({
        where: { id: product.id },
        select: { avgRating: true, reviewCount: true },
      });

      expect(res.status).toBe(200);
      expect(productAfterReject?.avgRating).toBe(0);
      expect(productAfterReject?.reviewCount).toBe(0);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('returns 401 when no token is provided', async () => {
      const product = await createProduct();
      const review = await createReview({ userId: customerUser.id, productId: product.id, rating: 5 });

      const res = await request(app).delete(`/api/reviews/${review.id}`);

      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      const product = await createProduct();
      const review = await createReview({ userId: customerUser.id, productId: product.id, rating: 5 });

      const res = await request(app)
        .delete(`/api/reviews/${review.id}`)
        .set('Authorization', otherCustomerToken);

      expect(res.status).toBe(403);
    });

    it('returns 404 when review is not found', async () => {
      const res = await request(app)
        .delete('/api/reviews/missing-review-id')
        .set('Authorization', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('deletes review and updates product rating stats', async () => {
      const product = await createProduct();
      const review = await createReview({
        userId: customerUser.id,
        productId: product.id,
        rating: 5,
        isApproved: true,
      });
      await prisma.product.update({
        where: { id: product.id },
        data: { avgRating: 5, reviewCount: 1 },
      });

      const res = await request(app)
        .delete(`/api/reviews/${review.id}`)
        .set('Authorization', adminToken);

      const deleted = await prisma.review.findUnique({ where: { id: review.id } });
      const productAfterDelete = await prisma.product.findUnique({
        where: { id: product.id },
        select: { avgRating: true, reviewCount: true },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(deleted).toBeNull();
      expect(productAfterDelete?.avgRating).toBe(0);
      expect(productAfterDelete?.reviewCount).toBe(0);
    });
  });

  interface TestAdminReview {
    id: string;
    isApproved: boolean;
    user: {
      name: string;
    };
    product: {
      name: string;
    };
  }

  describe('GET /api/reviews/admin', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/api/reviews/admin');
      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      const res = await request(app)
        .get('/api/reviews/admin')
        .set('Authorization', customerToken);
      expect(res.status).toBe(403);
    });

    it('returns reviews for admin with pagination, user, and product info', async () => {
      const product = await createProduct();
      const review1 = await createReview({
        userId: customerUser.id,
        productId: product.id,
        rating: 4,
        isApproved: false,
        body: 'Pending review',
      });
      const review2 = await createReview({
        userId: otherCustomerUser.id,
        productId: product.id,
        rating: 5,
        isApproved: true,
        body: 'Approved review',
      });

      const res = await request(app)
        .get('/api/reviews/admin')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      
      const r1 = res.body.data.find((r: TestAdminReview) => r.id === review1.id);
      const r2 = res.body.data.find((r: TestAdminReview) => r.id === review2.id);
      expect(r1).toBeDefined();
      expect(r1.user.name).toBe(customerUser.name);
      expect(r1.product.name).toBeDefined();
      expect(r1.isApproved).toBe(false);

      expect(r2).toBeDefined();
      expect(r2.user.name).toBe(otherCustomerUser.name);
      expect(r2.isApproved).toBe(true);
    });

    it('filters reviews by isApproved status', async () => {
      const product = await createProduct();
      const reviewPending = await createReview({
        userId: customerUser.id,
        productId: product.id,
        rating: 4,
        isApproved: false,
        body: 'Pending',
      });

      const resApproved = await request(app)
        .get('/api/reviews/admin?isApproved=true')
        .set('Authorization', adminToken);
      
      const resPending = await request(app)
        .get('/api/reviews/admin?isApproved=false')
        .set('Authorization', adminToken);

      expect(resApproved.status).toBe(200);
      const foundPendingInApproved = resApproved.body.data.find((r: TestAdminReview) => r.id === reviewPending.id);
      expect(foundPendingInApproved).toBeUndefined();

      expect(resPending.status).toBe(200);
      const foundPendingInPending = resPending.body.data.find((r: TestAdminReview) => r.id === reviewPending.id);
      expect(foundPendingInPending).toBeDefined();
    });
  });
});

