// src/tests/category.test.ts
// Integration tests for /api/categories endpoints

import request from 'supertest';
import { app } from '../server';
import { prisma } from '../config/db';
import type { Category } from '@prisma/client';
import { createTestUser, getBearerToken, cleanupUsers } from './helpers/testHelpers';
import type { TestUser } from './helpers/testHelpers';

// ── Helpers ───────────────────────────────────────────────

async function createTestCategory(
  overrides: Partial<{
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    parentId: string | null;
  }> = {},
): Promise<Category> {
  const slug = overrides.slug ?? `test-cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return prisma.category.create({
    data: {
      name: overrides.name ?? 'Test Category',
      slug,
      description: overrides.description ?? null,
      isActive: overrides.isActive ?? true,
      parentId: overrides.parentId ?? null,
    },
  });
}

async function cleanupCategories(...slugs: string[]): Promise<void> {
  await prisma.category.deleteMany({ where: { slug: { in: slugs } } });
}

// ── Test setup ────────────────────────────────────────────

let adminUser: TestUser;
let customerUser: TestUser;
let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  adminUser = await createTestUser({ role: 'ADMIN', email: `admin-cat-${Date.now()}@test.com` });
  customerUser = await createTestUser({ role: 'CUSTOMER', email: `customer-cat-${Date.now()}@test.com` });
  adminToken = getBearerToken(adminUser);
  customerToken = getBearerToken(customerUser);
});

afterAll(async () => {
  await prisma.category.deleteMany({ where: { slug: { startsWith: 'test-cat-' } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: 'integration-' } } });
  await cleanupUsers(adminUser.email, customerUser.email);
});

// ── GET /api/categories ───────────────────────────────────

describe('GET /api/categories', () => {
  it('returns 200 with category tree (public)', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  it('only returns active top-level categories', async () => {
    const inactive = await createTestCategory({ isActive: false, slug: `test-cat-inactive-${Date.now()}` });
    const res = await request(app).get('/api/categories');
    const ids = res.body.data.categories.map((c: { id: string }) => c.id);
    expect(ids).not.toContain(inactive.id);
    await cleanupCategories(inactive.slug);
  });
});

// ── GET /api/categories/:slug ─────────────────────────────

describe('GET /api/categories/:slug', () => {
  it('returns 200 with category by slug (public)', async () => {
    const cat = await createTestCategory({ slug: `test-cat-slug-${Date.now()}` });
    const res = await request(app).get(`/api/categories/${cat.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.category.slug).toBe(cat.slug);
    await cleanupCategories(cat.slug);
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/categories/non-existent-slug-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid slug format', async () => {
    const res = await request(app).get('/api/categories/INVALID SLUG!!');
    expect(res.status).toBe(400);
  });
});

// ── POST /api/categories ──────────────────────────────────

describe('POST /api/categories', () => {
  it('returns 201 when admin creates a category', async () => {
    const slug = `integration-create-${Date.now()}`;
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', adminToken)
      .send({ name: 'Integration Category', slug });

    expect(res.status).toBe(201);
    expect(res.body.data.category.slug).toBe(slug);
    await cleanupCategories(slug);
  });

  it('auto-generates slug from name if not provided', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', adminToken)
      .send({ name: 'Auto Slug Category' });

    expect(res.status).toBe(201);
    expect(res.body.data.category.slug).toMatch(/auto-slug-category/);
    await cleanupCategories(res.body.data.category.slug);
  });

  it('returns 409 for duplicate slug', async () => {
    const cat = await createTestCategory({ slug: `test-cat-dup-${Date.now()}` });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', adminToken)
      .send({ name: 'Dup', slug: cat.slug });

    expect(res.status).toBe(409);
    await cleanupCategories(cat.slug);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'No Auth', slug: 'no-auth-cat' });
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', customerToken)
      .send({ name: 'Customer Cat', slug: 'customer-cat-xyz' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', adminToken)
      .send({ slug: 'no-name-cat' });
    expect(res.status).toBe(400);
  });

  it('creates category with parent relation', async () => {
    const parent = await createTestCategory({ slug: `test-cat-parent-${Date.now()}` });
    const childSlug = `test-cat-child-${Date.now()}`;

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', adminToken)
      .send({ name: 'Child Cat', slug: childSlug, parentId: parent.id });

    expect(res.status).toBe(201);
    expect(res.body.data.category.parentId).toBe(parent.id);
    await cleanupCategories(childSlug, parent.slug);
  });

  it('returns 404 when parentId does not exist', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', adminToken)
      .send({ name: 'Orphan', slug: `test-cat-orphan-${Date.now()}`, parentId: 'non-existent-id' });
    expect(res.status).toBe(404);
  });
});

// ── PUT /api/categories/:id ───────────────────────────────

describe('PUT /api/categories/:id', () => {
  it('returns 200 when admin updates a category', async () => {
    const cat = await createTestCategory({ slug: `test-cat-upd-${Date.now()}` });

    const res = await request(app)
      .put(`/api/categories/${cat.id}`)
      .set('Authorization', adminToken)
      .send({ name: 'Updated Name', isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.category.name).toBe('Updated Name');
    expect(res.body.data.category.isActive).toBe(false);
    await cleanupCategories(cat.slug);
  });

  it('returns 404 for non-existent category', async () => {
    const res = await request(app)
      .put('/api/categories/non-existent-id-xxx')
      .set('Authorization', adminToken)
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });

  it('returns 409 for slug conflict on update', async () => {
    const cat1 = await createTestCategory({ slug: `test-cat-s1-${Date.now()}` });
    const cat2 = await createTestCategory({ slug: `test-cat-s2-${Date.now()}` });

    const res = await request(app)
      .put(`/api/categories/${cat2.id}`)
      .set('Authorization', adminToken)
      .send({ slug: cat1.slug });

    expect(res.status).toBe(409);
    await cleanupCategories(cat1.slug, cat2.slug);
  });

  it('returns 400 for self-reference as parent', async () => {
    const cat = await createTestCategory({ slug: `test-cat-self-${Date.now()}` });

    const res = await request(app)
      .put(`/api/categories/${cat.id}`)
      .set('Authorization', adminToken)
      .send({ parentId: cat.id });

    expect(res.status).toBe(400);
    await cleanupCategories(cat.slug);
  });

  it('returns 401 without token', async () => {
    const cat = await createTestCategory({ slug: `test-cat-noauth-${Date.now()}` });
    const res = await request(app)
      .put(`/api/categories/${cat.id}`)
      .send({ name: 'No Auth Update' });
    expect(res.status).toBe(401);
    await cleanupCategories(cat.slug);
  });

  it('returns 403 for customer role', async () => {
    const cat = await createTestCategory({ slug: `test-cat-cust-${Date.now()}` });
    const res = await request(app)
      .put(`/api/categories/${cat.id}`)
      .set('Authorization', customerToken)
      .send({ name: 'Forbidden Update' });
    expect(res.status).toBe(403);
    await cleanupCategories(cat.slug);
  });
});

// ── DELETE /api/categories/:id ────────────────────────────

describe('DELETE /api/categories/:id', () => {
  it('returns 200 when admin deletes an empty category', async () => {
    const cat = await createTestCategory({ slug: `test-cat-del-${Date.now()}` });

    const res = await request(app)
      .delete(`/api/categories/${cat.id}`)
      .set('Authorization', adminToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for non-existent category', async () => {
    const res = await request(app)
      .delete('/api/categories/non-existent-del-id')
      .set('Authorization', adminToken);
    expect(res.status).toBe(404);
  });

  it('returns 409 when category has children', async () => {
    const parent = await createTestCategory({ slug: `test-cat-par2-${Date.now()}` });
    const child = await createTestCategory({
      slug: `test-cat-chld2-${Date.now()}`,
      parentId: parent.id,
    });

    const res = await request(app)
      .delete(`/api/categories/${parent.id}`)
      .set('Authorization', adminToken);

    expect(res.status).toBe(409);
    // Cleanup child first, then parent
    await prisma.category.delete({ where: { id: child.id } });
    await prisma.category.delete({ where: { id: parent.id } });
  });

  it('returns 401 without token', async () => {
    const cat = await createTestCategory({ slug: `test-cat-noauth-del-${Date.now()}` });
    const res = await request(app).delete(`/api/categories/${cat.id}`);
    expect(res.status).toBe(401);
    await cleanupCategories(cat.slug);
  });

  it('returns 403 for customer role', async () => {
    const cat = await createTestCategory({ slug: `test-cat-cust-del-${Date.now()}` });
    const res = await request(app)
      .delete(`/api/categories/${cat.id}`)
      .set('Authorization', customerToken);
    expect(res.status).toBe(403);
    await cleanupCategories(cat.slug);
  });
});
