// src/tests/address.test.ts
// Integration tests for /api/addresses — CRUD, auth, validation, edge cases

import supertest from 'supertest';
import { app } from '../server';
import { createTestUser, getBearerToken, cleanupUsers, TestUser } from './helpers/testHelpers';

const api = supertest(app);

let customerUser: TestUser;
let otherCustomer: TestUser;
let testAddressId: string;
let otherAddressId: string;

const CUSTOMER_EMAIL = 'addr-customer@test.com';
const OTHER_CUSTOMER_EMAIL = 'addr-other@test.com';

const ADDRESS_PAYLOAD = {
  fullName: 'Test İstifadəçi',
  phone: '+994501234567',
  city: 'Bakı',
  district: 'Nəsimi',
  street: 'Nizami küçəsi 10',
  building: '5A',
  apartment: '12',
  isDefault: false,
};

beforeAll(async () => {
  [customerUser, otherCustomer] = await Promise.all([
    createTestUser({ email: CUSTOMER_EMAIL, role: 'CUSTOMER' }),
    createTestUser({ email: OTHER_CUSTOMER_EMAIL, role: 'CUSTOMER' }),
  ]);
});

afterAll(async () => {
  await cleanupUsers(CUSTOMER_EMAIL, OTHER_CUSTOMER_EMAIL);
});

// ── GET /api/addresses ─────────────────────────────────────

describe('GET /api/addresses', () => {
  it('returns 401 when no token provided', async () => {
    const res = await api.get('/api/addresses');
    expect(res.status).toBe(401);
  });

  it('returns empty array for user with no addresses (200)', async () => {
    const res = await api
      .get('/api/addresses')
      .set('Authorization', getBearerToken(customerUser));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });
});

// ── POST /api/addresses ────────────────────────────────────

describe('POST /api/addresses', () => {
  it('returns 401 when no token provided', async () => {
    const res = await api.post('/api/addresses').send(ADDRESS_PAYLOAD);
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await api
      .post('/api/addresses')
      .set('Authorization', getBearerToken(customerUser))
      .send({ fullName: 'Test' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid phone format', async () => {
    const res = await api
      .post('/api/addresses')
      .set('Authorization', getBearerToken(customerUser))
      .send({ ...ADDRESS_PAYLOAD, phone: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty fullName', async () => {
    const res = await api
      .post('/api/addresses')
      .set('Authorization', getBearerToken(customerUser))
      .send({ ...ADDRESS_PAYLOAD, fullName: '' });
    expect(res.status).toBe(400);
  });

  it('creates address successfully (201)', async () => {
    const res = await api
      .post('/api/addresses')
      .set('Authorization', getBearerToken(customerUser))
      .send(ADDRESS_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.fullName).toBe(ADDRESS_PAYLOAD.fullName);
    expect(res.body.data.city).toBe(ADDRESS_PAYLOAD.city);
    expect(res.body.data.isDefault).toBe(false);

    testAddressId = res.body.data.id;
  });

  it('creates second address as default, removing previous default (201)', async () => {
    const res = await api
      .post('/api/addresses')
      .set('Authorization', getBearerToken(customerUser))
      .send({ ...ADDRESS_PAYLOAD, street: 'Füzuli küçəsi 15', isDefault: true });

    expect(res.status).toBe(201);
    expect(res.body.data.isDefault).toBe(true);
    otherAddressId = res.body.data.id;

    // Verify first address is no longer default
    const check = await api
      .get('/api/addresses')
      .set('Authorization', getBearerToken(customerUser));
    const firstAddr = check.body.data.find((a: { id: string }) => a.id === testAddressId);
    expect(firstAddr.isDefault).toBe(false);
  });

  it('creates address for other customer to test cross-user access (201)', async () => {
    const res = await api
      .post('/api/addresses')
      .set('Authorization', getBearerToken(otherCustomer))
      .send(ADDRESS_PAYLOAD);
    expect(res.status).toBe(201);
  });
});

// ── GET /api/addresses (after creation) ────────────────────

describe('GET /api/addresses (after creation)', () => {
  it('returns user addresses sorted by default first (200)', async () => {
    const res = await api
      .get('/api/addresses')
      .set('Authorization', getBearerToken(customerUser));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].isDefault).toBe(true);
  });
});

// ── PUT /api/addresses/:id ─────────────────────────────────

describe('PUT /api/addresses/:id', () => {
  it('returns 401 when no token provided', async () => {
    const res = await api.put(`/api/addresses/${testAddressId}`).send({ fullName: 'Yeni Ad' });
    expect(res.status).toBe(401);
  });

  it('returns 403 when accessing another user\'s address', async () => {
    const res = await api
      .put(`/api/addresses/${testAddressId}`)
      .set('Authorization', getBearerToken(otherCustomer))
      .send({ fullName: 'Yeni Ad' });
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent address', async () => {
    const res = await api
      .put('/api/addresses/non-existent-id')
      .set('Authorization', getBearerToken(customerUser))
      .send({ fullName: 'Yeni Ad' });
    expect(res.status).toBe(404);
  });

  it('updates address successfully (200)', async () => {
    const res = await api
      .put(`/api/addresses/${testAddressId}`)
      .set('Authorization', getBearerToken(customerUser))
      .send({ fullName: 'Yenilənmiş Ad', city: 'Sumqayıt' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Yenilənmiş Ad');
    expect(res.body.data.city).toBe('Sumqayıt');
  });

  it('updates isDefault and unsets previous default (200)', async () => {
    const res = await api
      .put(`/api/addresses/${testAddressId}`)
      .set('Authorization', getBearerToken(customerUser))
      .send({ isDefault: true });

    expect(res.status).toBe(200);
    expect(res.body.data.isDefault).toBe(true);

    // Verify other address is no longer default
    const listRes = await api
      .get('/api/addresses')
      .set('Authorization', getBearerToken(customerUser));
    const otherAddr = listRes.body.data.find((a: { id: string }) => a.id === otherAddressId);
    expect(otherAddr.isDefault).toBe(false);
  });
});

// ── PATCH /api/addresses/:id/default ───────────────────────

describe('PATCH /api/addresses/:id/default', () => {
  it('returns 401 when no token provided', async () => {
    const res = await api.patch(`/api/addresses/${testAddressId}/default`);
    expect(res.status).toBe(401);
  });

  it('returns 403 when accessing another user\'s address', async () => {
    const res = await api
      .patch(`/api/addresses/${testAddressId}/default`)
      .set('Authorization', getBearerToken(otherCustomer));
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent address', async () => {
    const res = await api
      .patch('/api/addresses/non-existent-id/default')
      .set('Authorization', getBearerToken(customerUser));
    expect(res.status).toBe(404);
  });

  it('sets address as default successfully (200)', async () => {
    // First set testAddressId to non-default to test the patch
    await api
      .put(`/api/addresses/${testAddressId}`)
      .set('Authorization', getBearerToken(customerUser))
      .send({ isDefault: false });

    await api
      .put(`/api/addresses/${otherAddressId}`)
      .set('Authorization', getBearerToken(customerUser))
      .send({ isDefault: true });

    const res = await api
      .patch(`/api/addresses/${testAddressId}/default`)
      .set('Authorization', getBearerToken(customerUser));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify only testAddressId is default now
    const listRes = await api
      .get('/api/addresses')
      .set('Authorization', getBearerToken(customerUser));

    const target = listRes.body.data.find((a: { id: string }) => a.id === testAddressId);
    const other = listRes.body.data.find((a: { id: string }) => a.id === otherAddressId);

    expect(target.isDefault).toBe(true);
    expect(other.isDefault).toBe(false);
  });
});

// ── DELETE /api/addresses/:id ──────────────────────────────

describe('DELETE /api/addresses/:id', () => {
  it('returns 401 when no token provided', async () => {
    const res = await api.delete(`/api/addresses/${testAddressId}`);
    expect(res.status).toBe(401);
  });

  it('returns 403 when accessing another user\'s address', async () => {
    const res = await api
      .delete(`/api/addresses/${testAddressId}`)
      .set('Authorization', getBearerToken(otherCustomer));
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent address', async () => {
    const res = await api
      .delete('/api/addresses/non-existent-id')
      .set('Authorization', getBearerToken(customerUser));
    expect(res.status).toBe(404);
  });

  it('deletes address successfully (200)', async () => {
    // Create a disposable address for deletion
    const createRes = await api
      .post('/api/addresses')
      .set('Authorization', getBearerToken(customerUser))
      .send({ ...ADDRESS_PAYLOAD, street: 'Silinəcək küçə 1' });

    expect(createRes.status).toBe(201);
    const deleteId = createRes.body.data.id;

    const res = await api
      .delete(`/api/addresses/${deleteId}`)
      .set('Authorization', getBearerToken(customerUser));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is gone
    const check = await api
      .get('/api/addresses')
      .set('Authorization', getBearerToken(customerUser));
    const found = check.body.data.find((a: { id: string }) => a.id === deleteId);
    expect(found).toBeUndefined();
  });
});
