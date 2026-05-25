// src/tests/auth.test.ts
// Integration tests for all auth endpoints

import request from 'supertest';
import { app } from '../server';
import { prisma } from '../config/db';
import { createTestUser, getBearerToken, cleanupUsers } from './helpers/testHelpers';

// ── Mocks ────────────────────────────────────────────────
jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  buildVerifyEmailHtml: jest.fn().mockReturnValue('<html></html>'),
  buildResetPasswordHtml: jest.fn().mockReturnValue('<html></html>'),
}));

const TEST_EMAIL = 'auth-test@shopflow.dev';
const TEST_PASSWORD = 'SecurePass123!';

beforeEach(async () => {
  await cleanupUsers(TEST_EMAIL);
});

afterAll(async () => {
  await cleanupUsers(TEST_EMAIL);
  await prisma.$disconnect();
});

// ── POST /api/auth/register ───────────────────────────────
describe('POST /api/auth/register', () => {
  it('201 — registers a new CUSTOMER successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Customer',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: 'CUSTOMER',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(TEST_EMAIL);
    expect(res.body.data.role).toBe('CUSTOMER');
  });

  it('409 — returns error when email already exists', async () => {
    await createTestUser({ email: TEST_EMAIL });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('400 — returns validation error for invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('400 — returns validation error for short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: TEST_EMAIL,
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('400 — requires storeName when role is VENDOR', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Vendor User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: 'VENDOR',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── POST /api/auth/login ──────────────────────────────────
describe('POST /api/auth/login', () => {
  it('200 — logs in with correct credentials', async () => {
    await createTestUser({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('401 — rejects wrong password', async () => {
    await createTestUser({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('401 — rejects non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@shopflow.dev',
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('400 — returns validation error for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('403 — rejects deactivated account', async () => {
    await createTestUser({ email: TEST_EMAIL, password: TEST_PASSWORD, isActive: false });

    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ACCOUNT_DISABLED');
  });
});

// ── POST /api/auth/logout ─────────────────────────────────
describe('POST /api/auth/logout', () => {
  it('200 — logs out and clears refresh token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ── POST /api/auth/refresh-token ──────────────────────────
describe('POST /api/auth/refresh-token', () => {
  it('401 — returns error when no refresh token cookie', async () => {
    const res = await request(app).post('/api/auth/refresh-token');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });
});

// ── POST /api/auth/forgot-password ───────────────────────
describe('POST /api/auth/forgot-password', () => {
  it('200 — always returns 200 to prevent email enumeration', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@shopflow.dev' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('200 — sends reset email for valid account', async () => {
    await createTestUser({ email: TEST_EMAIL });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: TEST_EMAIL });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('400 — validation error for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'bad-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

// ── POST /api/auth/reset-password/:token ─────────────────
describe('POST /api/auth/reset-password/:token', () => {
  it('400 — returns error for invalid reset token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/invalid-token-123')
      .send({ password: 'NewPassword123!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('400 — validation error for short password', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/any-token')
      .send({ password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

// ── GET /api/auth/verify-email/:token ────────────────────
describe('GET /api/auth/verify-email/:token', () => {
  it('400 — returns error for invalid verify token', async () => {
    const res = await request(app).get('/api/auth/verify-email/invalid-token-xyz');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });
});

// ── GET /api/auth/me ──────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('200 — returns profile for authenticated user', async () => {
    const user = await createTestUser({ email: TEST_EMAIL });
    const token = getBearerToken(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(TEST_EMAIL);
  });

  it('401 — rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('401 — rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });
});
