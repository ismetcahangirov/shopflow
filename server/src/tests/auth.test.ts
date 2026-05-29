// src/tests/auth.test.ts
// Integration tests for all auth endpoints

import request from 'supertest';
import crypto from 'crypto';
import { app } from '../server';
import { prisma } from '../config/db';
import { createTestUser, getBearerToken, cleanupUsers } from './helpers/testHelpers';
import { generateRefreshToken } from '../utils/generateToken';

var mockVerifyIdToken: jest.Mock;

// ── Mocks ────────────────────────────────────────────────
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => {
    mockVerifyIdToken = jest.fn();
    return {
      verifyIdToken: mockVerifyIdToken,
    };
  }),
}));

jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  buildVerifyEmailHtml: jest.fn().mockReturnValue('<html></html>'),
  buildResetPasswordHtml: jest.fn().mockReturnValue('<html></html>'),
}));

const TEST_EMAIL = 'auth-test@shopflow.dev';
const GOOGLE_NEW_EMAIL = 'google-new-auth-test@shopflow.dev';
const GOOGLE_LINK_EMAIL = 'google-link-auth-test@shopflow.dev';
const GOOGLE_DISABLED_EMAIL = 'google-disabled-auth-test@shopflow.dev';
const TEST_PASSWORD = 'SecurePass123!';

beforeEach(async () => {
  mockVerifyIdToken.mockReset();
  await cleanupUsers(TEST_EMAIL, GOOGLE_NEW_EMAIL, GOOGLE_LINK_EMAIL, GOOGLE_DISABLED_EMAIL);
});

afterAll(async () => {
  await cleanupUsers(TEST_EMAIL, GOOGLE_NEW_EMAIL, GOOGLE_LINK_EMAIL, GOOGLE_DISABLED_EMAIL);
  await prisma.$disconnect();
});

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cookieFromResponse(res: request.Response): string {
  const setCookie = res.headers['set-cookie'];
  expect(setCookie).toBeDefined();
  return Array.isArray(setCookie) ? setCookie[0] : setCookie;
}

function mockGooglePayload(payload: {
  email?: string;
  sub?: string;
  name?: string;
  picture?: string;
}): void {
  mockVerifyIdToken.mockResolvedValue({
    getPayload: () => payload,
  });
}

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

// ── POST /api/auth/refresh-token extended coverage ───────
describe('POST /api/auth/refresh-token success and edge cases', () => {
  it('200 - rotates refresh token and returns a new access token', async () => {
    await createTestUser({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    const oldCookie = cookieFromResponse(loginRes);
    const oldUser = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_EMAIL },
      select: { refreshToken: true },
    });

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', oldCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_EMAIL },
      select: { refreshToken: true },
    });
    expect(updatedUser.refreshToken).toBeDefined();
    expect(updatedUser.refreshToken).not.toBe(oldUser.refreshToken);
  });

  it('401 - rejects malformed refresh token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', 'refreshToken=not-a-jwt');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('401 - rejects stale refresh token after rotation', async () => {
    await createTestUser({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    const oldCookie = cookieFromResponse(loginRes);

    await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', oldCookie)
      .expect(200);

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', oldCookie);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('403 - rejects refresh token for deactivated account', async () => {
    const user = await createTestUser({ email: TEST_EMAIL, isActive: false });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashRefreshToken(refreshToken) },
    });

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ACCOUNT_DISABLED');
  });
});

// ── POST /api/auth/google ────────────────────────────────
describe('POST /api/auth/google', () => {
  it('400 - returns validation error when idToken is missing', async () => {
    const res = await request(app).post('/api/auth/google').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('401 - rejects Google payload without required fields', async () => {
    mockGooglePayload({ email: GOOGLE_NEW_EMAIL });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'google-token-without-sub' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('200 - creates a new verified customer from Google payload', async () => {
    mockGooglePayload({
      email: GOOGLE_NEW_EMAIL,
      sub: 'google-new-sub',
      name: 'Google New User',
      picture: 'https://example.com/avatar.png',
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'google-new-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(GOOGLE_NEW_EMAIL);
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.headers['set-cookie']).toBeDefined();

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: GOOGLE_NEW_EMAIL },
      select: { googleId: true, isVerified: true, refreshToken: true, avatar: true },
    });
    expect(user.googleId).toBe('google-new-sub');
    expect(user.isVerified).toBe(true);
    expect(user.refreshToken).toBeDefined();
    expect(user.avatar).toBe('https://example.com/avatar.png');
  });

  it('200 - links Google account to an existing email user', async () => {
    await createTestUser({ email: GOOGLE_LINK_EMAIL, isVerified: false });
    mockGooglePayload({
      email: GOOGLE_LINK_EMAIL,
      sub: 'google-link-sub',
      name: 'Linked Google User',
      picture: 'https://example.com/linked.png',
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'google-link-token' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(GOOGLE_LINK_EMAIL);
    expect(res.body.data.user.isVerified).toBe(true);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: GOOGLE_LINK_EMAIL },
      select: { googleId: true, isVerified: true, refreshToken: true },
    });
    expect(user.googleId).toBe('google-link-sub');
    expect(user.isVerified).toBe(true);
    expect(user.refreshToken).toBeDefined();
  });

  it('403 - rejects Google login for deactivated account', async () => {
    await createTestUser({ email: GOOGLE_DISABLED_EMAIL, isActive: false });
    mockGooglePayload({
      email: GOOGLE_DISABLED_EMAIL,
      sub: 'google-disabled-sub',
      name: 'Disabled Google User',
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'google-disabled-token' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ACCOUNT_DISABLED');
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
