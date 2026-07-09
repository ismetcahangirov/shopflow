// src/tests/vendorScoping.test.ts
// Integration tests for the vendor-scoped /api/vendors/me/* endpoints.
// Verifies a vendor only ever sees their OWN products/orders/sales — never another vendor's.

// Mock Cloudinary so the logo/banner upload endpoints don't hit the network.
jest.mock('../config/cloudinary', () => ({
  __esModule: true,
  default: {
    uploader: {
      upload_stream: (
        _opts: unknown,
        cb: (err: unknown, result: { secure_url: string; public_id: string }) => void,
      ) => ({
        end: () => cb(null, { secure_url: 'https://res.cloudinary.com/test/vendors/logo.png', public_id: 'vendors/logo' }),
      }),
    },
  },
}));

import supertest from 'supertest';
import { app } from '../server';
import { prisma } from '../config/db';
import { createTestUser, getBearerToken, TestUser } from './helpers/testHelpers';

const api = supertest(app);
jest.setTimeout(120000);

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMAILS = {
  vendorA: `vendor-a-scope-${RUN_ID}@test.com`,
  vendorB: `vendor-b-scope-${RUN_ID}@test.com`,
  customer: `customer-scope-${RUN_ID}@test.com`,
};

let vendorAUser: TestUser;
let vendorBUser: TestUser;
let customerUser: TestUser;
let vendorAToken: string;
let vendorBToken: string;
let vendorAId: string;
let vendorBId: string;

// Fixture ids we assert on
let productA1Id: string; // vendor A, low stock, in the paid+delivered order
let productA2Id: string; // vendor A, healthy stock, in a pending unpaid order
let productB1Id: string; // vendor B
let categoryId: string;
let addressId: string;
let orderPaidId: string; // vendor A, PAID + DELIVERED
let orderPendingId: string; // vendor A, UNPAID + PENDING
let orderBId: string; // vendor B, PAID

const A1_PRICE = 100;
const A1_QTY = 2; // vendor A paid revenue = 200
const B1_PRICE = 50;

async function vendorIdFor(userId: string): Promise<string> {
  const v = await prisma.vendor.findUnique({ where: { userId }, select: { id: true } });
  return v!.id;
}

async function createProduct(opts: { vendorId: string; sku: string; slug: string; price: number; stock: number; lowStockAlert?: number }): Promise<string> {
  const p = await prisma.product.create({
    data: {
      name: `Scope Product ${opts.sku}`,
      slug: opts.slug,
      description: 'vendor scoping test product',
      price: opts.price,
      sku: opts.sku,
      stock: opts.stock,
      lowStockAlert: opts.lowStockAlert ?? 5,
      isActive: true,
      categoryId,
      vendorId: opts.vendorId,
    },
    select: { id: true },
  });
  return p.id;
}

async function createOrder(opts: {
  productId: string;
  productPrice: number;
  quantity: number;
  paymentStatus: 'PAID' | 'UNPAID';
  status: 'PENDING' | 'DELIVERED';
}): Promise<string> {
  const subtotal = opts.productPrice * opts.quantity;
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-SCOPE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: customerUser.id,
      addressId,
      subtotal,
      shippingCost: 0,
      discount: 0,
      tax: 0,
      total: subtotal,
      paymentMethod: 'stripe',
      status: opts.status,
      paymentStatus: opts.paymentStatus,
      items: {
        create: {
          productId: opts.productId,
          productName: 'Scope Product',
          productSku: `SKU-ITEM-${Math.random().toString(36).slice(2, 7)}`,
          quantity: opts.quantity,
          price: opts.productPrice,
          total: opts.productPrice * opts.quantity,
        },
      },
    },
    select: { id: true },
  });
  return order.id;
}

beforeAll(async () => {
  [vendorAUser, vendorBUser, customerUser] = await Promise.all([
    createTestUser({ email: EMAILS.vendorA, name: 'Vendor A Store', role: 'VENDOR' }),
    createTestUser({ email: EMAILS.vendorB, name: 'Vendor B Store', role: 'VENDOR' }),
    createTestUser({ email: EMAILS.customer, role: 'CUSTOMER' }),
  ]);
  vendorAToken = getBearerToken(vendorAUser);
  vendorBToken = getBearerToken(vendorBUser);
  vendorAId = await vendorIdFor(vendorAUser.id);
  vendorBId = await vendorIdFor(vendorBUser.id);

  const category = await prisma.category.create({
    data: { name: `Scope Cat ${RUN_ID}`, slug: `scope-cat-${RUN_ID}`, isActive: true },
    select: { id: true },
  });
  categoryId = category.id;

  const address = await prisma.address.create({
    data: {
      fullName: 'Scope Customer', phone: '+994500000000', city: 'Baki', district: 'Nesimi',
      street: 'Scope st 1', isDefault: true, userId: customerUser.id,
    },
    select: { id: true },
  });
  addressId = address.id;

  productA1Id = await createProduct({ vendorId: vendorAId, sku: `A1-${RUN_ID}`, slug: `scope-a1-${RUN_ID}`, price: A1_PRICE, stock: 3, lowStockAlert: 5 });
  productA2Id = await createProduct({ vendorId: vendorAId, sku: `A2-${RUN_ID}`, slug: `scope-a2-${RUN_ID}`, price: 40, stock: 50 });
  productB1Id = await createProduct({ vendorId: vendorBId, sku: `B1-${RUN_ID}`, slug: `scope-b1-${RUN_ID}`, price: B1_PRICE, stock: 50 });

  orderPaidId = await createOrder({ productId: productA1Id, productPrice: A1_PRICE, quantity: A1_QTY, paymentStatus: 'PAID', status: 'DELIVERED' });
  orderPendingId = await createOrder({ productId: productA2Id, productPrice: 40, quantity: 1, paymentStatus: 'UNPAID', status: 'PENDING' });
  orderBId = await createOrder({ productId: productB1Id, productPrice: B1_PRICE, quantity: 1, paymentStatus: 'PAID', status: 'DELIVERED' });
});

afterAll(async () => {
  const userIds = [vendorAUser.id, vendorBUser.id, customerUser.id];
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: [orderPaidId, orderPendingId, orderBId] } } });
  await prisma.orderItem.deleteMany({ where: { orderId: { in: [orderPaidId, orderPendingId, orderBId] } } });
  await prisma.order.deleteMany({ where: { id: { in: [orderPaidId, orderPendingId, orderBId] } } });
  await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.product.deleteMany({ where: { id: { in: [productA1Id, productA2Id, productB1Id] } } });
  await prisma.category.deleteMany({ where: { id: categoryId } });
  await prisma.vendor.deleteMany({ where: { id: { in: [vendorAId, vendorBId] } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('GET /api/vendors/me/dashboard', () => {
  it('401 without a token', async () => {
    const res = await api.get('/api/vendors/me/dashboard');
    expect(res.status).toBe(401);
  });

  it('returns vendor-scoped summary, charts, and lists', async () => {
    const res = await api.get('/api/vendors/me/dashboard').set('Authorization', vendorAToken);
    expect(res.status).toBe(200);
    const d = res.body.data;

    expect(d.summary.totalProducts).toBe(2);
    expect(d.summary.totalRevenue).toBe(A1_PRICE * A1_QTY); // 200 — only the PAID order
    expect(d.summary.pendingOrders).toBeGreaterThanOrEqual(1);

    const topIds = d.topProducts.map((p: { id: string }) => p.id);
    expect(topIds).toContain(productA1Id);
    expect(topIds).not.toContain(productB1Id); // no cross-vendor leak

    const lowIds = d.lowStockProducts.map((p: { id: string }) => p.id);
    expect(lowIds).toContain(productA1Id); // stock 3 <= alert 5
    expect(lowIds).not.toContain(productA2Id); // stock 50

    const recentIds = d.recentOrders.map((o: { id: string }) => o.id);
    expect(recentIds).toContain(orderPaidId);
    expect(recentIds).not.toContain(orderBId); // vendor B's order excluded
    const paidRow = d.recentOrders.find((o: { id: string }) => o.id === orderPaidId);
    expect(paidRow.vendorSubtotal).toBe(A1_PRICE * A1_QTY);
  });

  it('a second vendor sees a disjoint dataset', async () => {
    const res = await api.get('/api/vendors/me/dashboard').set('Authorization', vendorBToken);
    expect(res.status).toBe(200);
    const topIds = res.body.data.topProducts.map((p: { id: string }) => p.id);
    expect(topIds).toContain(productB1Id);
    expect(topIds).not.toContain(productA1Id);
    expect(res.body.data.summary.totalRevenue).toBe(B1_PRICE); // 50
  });
});

describe('GET /api/vendors/me/orders', () => {
  it("returns only the vendor's orders with a vendor subtotal + pagination", async () => {
    const res = await api.get('/api/vendors/me/orders').set('Authorization', vendorAToken);
    expect(res.status).toBe(200);
    const ids = res.body.data.map((o: { id: string }) => o.id);
    expect(ids).toContain(orderPaidId);
    expect(ids).toContain(orderPendingId);
    expect(ids).not.toContain(orderBId);
    expect(res.body.pagination).toMatchObject({ page: 1 });
    const paid = res.body.data.find((o: { id: string }) => o.id === orderPaidId);
    expect(paid.vendorSubtotal).toBe(A1_PRICE * A1_QTY);
    expect(paid.vendorItemCount).toBe(A1_QTY);
  });

  it('filters by status', async () => {
    const res = await api.get('/api/vendors/me/orders?status=DELIVERED').set('Authorization', vendorAToken);
    expect(res.status).toBe(200);
    const ids = res.body.data.map((o: { id: string }) => o.id);
    expect(ids).toContain(orderPaidId);
    expect(ids).not.toContain(orderPendingId);
  });
});

describe('GET /api/vendors/me/analytics/sales', () => {
  it('returns vendor-scoped sales points (paid only)', async () => {
    const res = await api.get('/api/vendors/me/analytics/sales').set('Authorization', vendorAToken);
    expect(res.status).toBe(200);
    const totalRevenue = res.body.data.reduce((s: number, p: { revenue: number }) => s + p.revenue, 0);
    expect(totalRevenue).toBe(A1_PRICE * A1_QTY); // only paid order counts
  });
});

describe('POST /api/vendors/me/logo', () => {
  it('uploads and persists the logo url', async () => {
    const res = await api
      .post('/api/vendors/me/logo')
      .set('Authorization', vendorAToken)
      .attach('logo', Buffer.from('fake-image-bytes'), 'logo.png');
    expect(res.status).toBe(200);
    expect(res.body.data.logo).toContain('cloudinary');

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorAId }, select: { logo: true } });
    expect(vendor?.logo).toContain('cloudinary');
  });

  it('400 when no file is attached', async () => {
    const res = await api.post('/api/vendors/me/logo').set('Authorization', vendorAToken);
    expect(res.status).toBe(400);
  });
});
