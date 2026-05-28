// src/tests/coupon.test.ts
// Integration tests for /api/coupons endpoints

import supertest from 'supertest';
import { Coupon } from '@prisma/client';
import { app } from '../server';
import { prisma } from '../config/db';
import { createTestUser, getBearerToken, cleanupUsers, TestUser } from './helpers/testHelpers';

const api = supertest(app);

let adminUser: TestUser;
let customerUser: TestUser;
let adminToken: string;
let customerToken: string;

const TEST_EMAILS = ['admin-coupon-test@test.com', 'customer-coupon-test@test.com'];

const testCoupons: string[] = [];

async function trackAndCreateCoupon(data: {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount?: number;
  isActive?: boolean;
  startsAt?: Date;
  expiresAt?: Date;
}): Promise<Coupon> {
  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrderValue: data.minOrderValue,
      maxDiscount: data.maxDiscount,
      maxUses: data.maxUses,
      usedCount: data.usedCount ?? 0,
      isActive: data.isActive ?? true,
      startsAt: data.startsAt,
      expiresAt: data.expiresAt,
    },
  });
  testCoupons.push(coupon.id);
  return coupon;
}

beforeAll(async () => {
  // Clear any existing matching test emails
  await cleanupUsers(...TEST_EMAILS);

  [adminUser, customerUser] = await Promise.all([
    createTestUser({ email: TEST_EMAILS[0], role: 'ADMIN' }),
    createTestUser({ email: TEST_EMAILS[1], role: 'CUSTOMER' }),
  ]);

  adminToken = getBearerToken(adminUser);
  customerToken = getBearerToken(customerUser);
});

afterAll(async () => {
  // Clean up coupons created in tests
  await prisma.coupon.deleteMany({
    where: {
      id: { in: testCoupons },
    },
  });

  await cleanupUsers(...TEST_EMAILS);
});

describe('Coupon API Integration Tests', () => {
  // ── GET /api/coupons ──────────────────────────────────────
  describe('GET /api/coupons', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api.get('/api/coupons');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 if user is not an admin', async () => {
      const res = await api
        .get('/api/coupons')
        .set('Authorization', customerToken);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should list coupons for admin with pagination (200)', async () => {
      const coupon = await trackAndCreateCoupon({
        code: `GETTST${Date.now()}`,
        type: 'PERCENTAGE',
        value: 10,
      });

      const res = await api
        .get('/api/coupons')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('coupons');
      expect(res.body.pagination).toBeDefined();

      const found = res.body.data.coupons.find((c: { id: string }) => c.id === coupon.id);
      expect(found).toBeDefined();
      expect(found.code).toBe(coupon.code);
    });
  });

  // ── POST /api/coupons ─────────────────────────────────────
  describe('POST /api/coupons', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api
        .post('/api/coupons')
        .send({ code: 'NEWCOUPON', type: 'FIXED_AMOUNT', value: 15 });
      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      const res = await api
        .post('/api/coupons')
        .set('Authorization', customerToken)
        .send({ code: 'NEWCOUPON', type: 'FIXED_AMOUNT', value: 15 });
      expect(res.status).toBe(403);
    });

    it('should successfully create a new coupon for admin (201)', async () => {
      const code = `POSTTST${Date.now()}`;
      const res = await api
        .post('/api/coupons')
        .set('Authorization', adminToken)
        .send({
          code,
          type: 'PERCENTAGE',
          value: 20,
          minOrderValue: 50,
          maxDiscount: 100,
          maxUses: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coupon).toBeDefined();
      expect(res.body.data.coupon.code).toBe(code.toUpperCase());
      expect(res.body.data.coupon.value).toBe(20);
      expect(res.body.data.coupon.minOrderValue).toBe(50);
      expect(res.body.data.coupon.maxDiscount).toBe(100);
      expect(res.body.data.coupon.maxUses).toBe(10);

      // Track created coupon for cleanup
      testCoupons.push(res.body.data.coupon.id);
    });

    it('should return 400 if validation fails (percentage value > 100)', async () => {
      const res = await api
        .post('/api/coupons')
        .set('Authorization', adminToken)
        .send({
          code: 'FAILPCT',
          type: 'PERCENTAGE',
          value: 120,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 409 if coupon code already exists', async () => {
      const code = `DUPE${Date.now()}`;
      await trackAndCreateCoupon({
        code,
        type: 'PERCENTAGE',
        value: 10,
      });

      const res = await api
        .post('/api/coupons')
        .set('Authorization', adminToken)
        .send({
          code,
          type: 'FIXED_AMOUNT',
          value: 10,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('COUPON_ALREADY_EXISTS');
    });
  });

  // ── PUT /api/coupons/:id ──────────────────────────────────
  describe('PUT /api/coupons/:id', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api
        .put('/api/coupons/some-id')
        .send({ isActive: false });
      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      const res = await api
        .put('/api/coupons/some-id')
        .set('Authorization', customerToken)
        .send({ isActive: false });
      expect(res.status).toBe(403);
    });

    it('should return 404 if coupon is not found', async () => {
      const res = await api
        .put('/api/coupons/non-existent-coupon-id')
        .set('Authorization', adminToken)
        .send({ isActive: false });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('COUPON_NOT_FOUND');
    });

    it('should successfully update coupon for admin (200)', async () => {
      const coupon = await trackAndCreateCoupon({
        code: `PUTTST${Date.now()}`,
        type: 'FIXED_AMOUNT',
        value: 5,
        isActive: true,
      });

      const res = await api
        .put(`/api/coupons/${coupon.id}`)
        .set('Authorization', adminToken)
        .send({
          value: 8,
          isActive: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coupon.value).toBe(8);
      expect(res.body.data.coupon.isActive).toBe(false);
    });
  });

  // ── DELETE /api/coupons/:id ───────────────────────────────
  describe('DELETE /api/coupons/:id', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api.delete('/api/coupons/some-id');
      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      const res = await api
        .delete('/api/coupons/some-id')
        .set('Authorization', customerToken);
      expect(res.status).toBe(403);
    });

    it('should return 404 if coupon is not found', async () => {
      const res = await api
        .delete('/api/coupons/non-existent-coupon-id')
        .set('Authorization', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('COUPON_NOT_FOUND');
    });

    it('should successfully delete coupon for admin (200)', async () => {
      const coupon = await trackAndCreateCoupon({
        code: `DELTST${Date.now()}`,
        type: 'FIXED_AMOUNT',
        value: 12,
      });

      const res = await api
        .delete(`/api/coupons/${coupon.id}`)
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deleted from database
      const check = await prisma.coupon.findUnique({
        where: { id: coupon.id },
      });
      expect(check).toBeNull();
    });
  });

  // ── POST /api/coupons/validate ───────────────────────────
  describe('POST /api/coupons/validate', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await api
        .post('/api/coupons/validate')
        .send({ code: 'VALTST', subtotal: 100 });
      expect(res.status).toBe(401);
    });

    it('should successfully validate percentage coupon and return calculated discount (200)', async () => {
      const code = `VALPCT${Date.now()}`;
      await trackAndCreateCoupon({
        code,
        type: 'PERCENTAGE',
        value: 15,
        minOrderValue: 50,
        maxDiscount: 20,
      });

      const res = await api
        .post('/api/coupons/validate')
        .set('Authorization', customerToken)
        .send({
          code,
          subtotal: 100,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.discount).toBe(15); // 15% of 100 = 15. Max discount is 20, so 15 is valid.
    });

    it('should apply maxDiscount cap on percentage coupon', async () => {
      const code = `VALCAP${Date.now()}`;
      await trackAndCreateCoupon({
        code,
        type: 'PERCENTAGE',
        value: 15,
        maxDiscount: 10,
      });

      const res = await api
        .post('/api/coupons/validate')
        .set('Authorization', customerToken)
        .send({
          code,
          subtotal: 100,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.discount).toBe(10); // 15% of 100 = 15. But max discount is capped at 10.
    });

    it('should return 404 if coupon code is not found', async () => {
      const res = await api
        .post('/api/coupons/validate')
        .set('Authorization', customerToken)
        .send({
          code: 'NONEXISTENTCOUPON',
          subtotal: 100,
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('COUPON_NOT_FOUND');
    });

    it('should return 400 if coupon is not active', async () => {
      const code = `VALINACT${Date.now()}`;
      await trackAndCreateCoupon({
        code,
        type: 'FIXED_AMOUNT',
        value: 10,
        isActive: false,
      });

      const res = await api
        .post('/api/coupons/validate')
        .set('Authorization', customerToken)
        .send({
          code,
          subtotal: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('COUPON_INACTIVE');
    });

    it('should return 400 if order subtotal is below minOrderValue', async () => {
      const code = `VALMIN${Date.now()}`;
      await trackAndCreateCoupon({
        code,
        type: 'FIXED_AMOUNT',
        value: 10,
        minOrderValue: 80,
      });

      const res = await api
        .post('/api/coupons/validate')
        .set('Authorization', customerToken)
        .send({
          code,
          subtotal: 50,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('COUPON_MIN_ORDER_VALUE');
    });

    it('should return 400 if coupon expiration date has passed', async () => {
      const code = `VALEXP${Date.now()}`;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await trackAndCreateCoupon({
        code,
        type: 'FIXED_AMOUNT',
        value: 10,
        expiresAt: yesterday,
      });

      const res = await api
        .post('/api/coupons/validate')
        .set('Authorization', customerToken)
        .send({
          code,
          subtotal: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('COUPON_EXPIRED');
    });

    it('should return 400 if coupon usage has reached maximum uses limit', async () => {
      const code = `VALMAX${Date.now()}`;
      await trackAndCreateCoupon({
        code,
        type: 'FIXED_AMOUNT',
        value: 10,
        maxUses: 5,
        usedCount: 5,
      });

      const res = await api
        .post('/api/coupons/validate')
        .set('Authorization', customerToken)
        .send({
          code,
          subtotal: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('COUPON_LIMIT_REACHED');
    });
  });
});
