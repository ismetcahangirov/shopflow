// src/tests/product.test.ts
// Integration tests for /api/products — CRUD, auth, validation, edge cases

import supertest from 'supertest';
import { app } from '../server';
import { prisma } from '../config/db';
import { createTestUser, getBearerToken, cleanupUsers, TestUser } from './helpers/testHelpers';

const api = supertest(app);

// ── Helpers ───────────────────────────────────────────────

let adminUser: TestUser;
let vendorUser: TestUser;
let customerUser: TestUser;
let testCategoryId: string;
let testProductId: string;
let testProductSlug: string;

const ADMIN_EMAILS = ['admin-prod@test.com'];
const VENDOR_EMAILS = ['vendor-prod@test.com'];
const CUSTOMER_EMAILS = ['customer-prod@test.com'];

const PRODUCT_PAYLOAD = {
  name: 'Test Məhsul',
  description: 'Bu test məhsulunun ətraflı açıqlamasıdır.',
  price: 49.99,
  sku: `SKU-${Date.now()}`,
  stock: 100,
};

async function createTestCategory(): Promise<string> {
  const slug = `test-cat-${Date.now()}`;
  const category = await prisma.category.create({
    data: { name: 'Test Kateqoriya', slug, isActive: true },
    select: { id: true },
  });
  return category.id;
}

async function cleanupProducts(): Promise<void> {
  await prisma.product.deleteMany({
    where: { name: { startsWith: 'Test' } },
  });
}

async function cleanupCategories(): Promise<void> {
  await prisma.category.deleteMany({
    where: { slug: { startsWith: 'test-cat-' } },
  });
}

// ── Setup / teardown ──────────────────────────────────────

beforeAll(async () => {
  [adminUser, vendorUser, customerUser] = await Promise.all([
    createTestUser({ email: ADMIN_EMAILS[0], role: 'ADMIN' }),
    createTestUser({ email: VENDOR_EMAILS[0], role: 'VENDOR' }),
    createTestUser({ email: CUSTOMER_EMAILS[0], role: 'CUSTOMER' }),
  ]);
  testCategoryId = await createTestCategory();
});

afterAll(async () => {
  await cleanupProducts();
  await cleanupCategories();
  await cleanupUsers(...ADMIN_EMAILS, ...VENDOR_EMAILS, ...CUSTOMER_EMAILS);
});

// ── GET /api/products ─────────────────────────────────────

describe('GET /api/products', () => {
  it('returns product list with pagination (200)', async () => {
    const res = await api.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('products');
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('supports search query (200)', async () => {
    const res = await api.get('/api/products?search=test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('supports categoryId filter (200)', async () => {
    const res = await api.get(`/api/products?categoryId=${testCategoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('supports price range filter (200)', async () => {
    const res = await api.get('/api/products?minPrice=0&maxPrice=1000');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('supports sort options (200)', async () => {
    const sorts = ['price_asc', 'price_desc', 'newest', 'popular', 'rating'];
    for (const sort of sorts) {
      const res = await api.get(`/api/products?sort=${sort}`);
      expect(res.status).toBe(200);
    }
  });

  it('returns 400 for invalid sort value', async () => {
    const res = await api.get('/api/products?sort=invalid');
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid page value', async () => {
    const res = await api.get('/api/products?page=0');
    expect(res.status).toBe(400);
  });
});

// ── GET /api/products/featured ────────────────────────────

describe('GET /api/products/featured', () => {
  it('returns featured products (200)', async () => {
    const res = await api.get('/api/products/featured');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });
});

// ── GET /api/products/search ──────────────────────────────

describe('GET /api/products/search', () => {
  it('returns empty array for very short query (200)', async () => {
    const res = await api.get('/api/products/search?q=a');
    expect(res.status).toBe(200);
    expect(res.body.data.products).toEqual([]);
  });

  it('returns results for valid query (200)', async () => {
    const res = await api.get('/api/products/search?q=test');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });
});

// ── GET /api/products/:slug ───────────────────────────────

describe('GET /api/products/:slug', () => {
  it('returns 404 for non-existent slug', async () => {
    const res = await api.get('/api/products/non-existent-slug-12345');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid slug format', async () => {
    const res = await api.get('/api/products/INVALID_SLUG');
    expect(res.status).toBe(400);
  });
});

// ── POST /api/products ────────────────────────────────────

describe('POST /api/products', () => {
  it('returns 401 when no token provided', async () => {
    const res = await api.post('/api/products').send({ ...PRODUCT_PAYLOAD, categoryId: testCategoryId });
    expect(res.status).toBe(401);
  });

  it('returns 403 for CUSTOMER role', async () => {
    const res = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(customerUser))
      .send({ ...PRODUCT_PAYLOAD, categoryId: testCategoryId });
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(adminUser))
      .send({ name: 'Test' }); // missing description, price, sku, categoryId
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative price', async () => {
    const res = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(adminUser))
      .send({ ...PRODUCT_PAYLOAD, categoryId: testCategoryId, price: -5 });
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent categoryId', async () => {
    const res = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(adminUser))
      .send({ ...PRODUCT_PAYLOAD, categoryId: 'non-existent-id', sku: `SKU-${Date.now()}-notfound` });
    expect(res.status).toBe(404);
  });

  it('creates product successfully as ADMIN (201)', async () => {
    const sku = `SKU-ADMIN-${Date.now()}`;
    const res = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(adminUser))
      .send({ ...PRODUCT_PAYLOAD, categoryId: testCategoryId, sku });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product).toHaveProperty('id');
    expect(res.body.data.product.name).toBe(PRODUCT_PAYLOAD.name);

    // Store for subsequent tests
    testProductId = res.body.data.product.id;
    testProductSlug = res.body.data.product.slug;
  });

  it('returns 409 for duplicate SKU', async () => {
    const res = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(adminUser))
      .send({ ...PRODUCT_PAYLOAD, categoryId: testCategoryId }); // same sku as PRODUCT_PAYLOAD
    expect(res.status).toBe(409);
  });

  it('creates product successfully as VENDOR (201)', async () => {
    const sku = `SKU-VENDOR-${Date.now()}`;
    const res = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(vendorUser))
      .send({ ...PRODUCT_PAYLOAD, categoryId: testCategoryId, sku, name: 'Test Vendor Məhsul' });
    expect(res.status).toBe(201);
  });
});

// ── GET /api/products/:slug (after creation) ──────────────

describe('GET /api/products/:slug (after creation)', () => {
  it('returns product detail by slug (200)', async () => {
    const res = await api.get(`/api/products/${testProductSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.product.id).toBe(testProductId);
    expect(res.body.data.product).toHaveProperty('images');
    expect(res.body.data.product).toHaveProperty('attributes');
    expect(res.body.data.product).toHaveProperty('variants');
  });
});

// ── PUT /api/products/:id ─────────────────────────────────

describe('PUT /api/products/:id', () => {
  it('returns 401 when no token provided', async () => {
    const res = await api.put(`/api/products/${testProductId}`).send({ name: 'Yeni Ad' });
    expect(res.status).toBe(401);
  });

  it('returns 403 for CUSTOMER role', async () => {
    const res = await api
      .put(`/api/products/${testProductId}`)
      .set('Authorization', getBearerToken(customerUser))
      .send({ name: 'Yeni Ad' });
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await api
      .put('/api/products/non-existent-id')
      .set('Authorization', getBearerToken(adminUser))
      .send({ name: 'Yeni Ad' });
    expect(res.status).toBe(404);
  });

  it('updates product name as ADMIN (200)', async () => {
    const res = await api
      .put(`/api/products/${testProductId}`)
      .set('Authorization', getBearerToken(adminUser))
      .send({ name: 'Test Məhsul Yeniləndi', isFeatured: true });

    expect(res.status).toBe(200);
    expect(res.body.data.product.name).toBe('Test Məhsul Yeniləndi');
    expect(res.body.data.product.isFeatured).toBe(true);
  });

  it('returns 409 for duplicate slug on update', async () => {
    // Create a second product first
    const sku2 = `SKU-SLUG2-${Date.now()}`;
    const createRes = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(adminUser))
      .send({ ...PRODUCT_PAYLOAD, categoryId: testCategoryId, sku: sku2, name: 'Test Məhsul İkinci' });
    expect(createRes.status).toBe(201);
    const secondSlug = createRes.body.data.product.slug;

    // Try to update testProduct with secondProduct's slug
    const res = await api
      .put(`/api/products/${testProductId}`)
      .set('Authorization', getBearerToken(adminUser))
      .send({ slug: secondSlug });
    expect(res.status).toBe(409);
  });
});

// ── DELETE /api/products/:id ──────────────────────────────

describe('DELETE /api/products/:id', () => {
  it('returns 401 when no token provided', async () => {
    const res = await api.delete(`/api/products/${testProductId}`);
    expect(res.status).toBe(401);
  });

  it('returns 403 for CUSTOMER role', async () => {
    const res = await api
      .delete(`/api/products/${testProductId}`)
      .set('Authorization', getBearerToken(customerUser));
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await api
      .delete('/api/products/non-existent-id')
      .set('Authorization', getBearerToken(adminUser));
    expect(res.status).toBe(404);
  });

  it('deletes product as ADMIN (200)', async () => {
    // Create a disposable product
    const sku = `SKU-DEL-${Date.now()}`;
    const createRes = await api
      .post('/api/products')
      .set('Authorization', getBearerToken(adminUser))
      .send({ ...PRODUCT_PAYLOAD, categoryId: testCategoryId, sku, name: 'Test Silinəcək Məhsul' });
    expect(createRes.status).toBe(201);
    const deleteId = createRes.body.data.product.id;

    const res = await api
      .delete(`/api/products/${deleteId}`)
      .set('Authorization', getBearerToken(adminUser));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
