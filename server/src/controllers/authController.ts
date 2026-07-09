// src/controllers/authController.ts
// Auth endpoints: register, login, logout, refresh, google, forgot/reset password, verify email

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/generateToken';
import { sendEmail, buildVerifyEmailHtml, buildResetPasswordHtml } from '../utils/sendEmail';
import { slugify } from '../utils/slugify';
import { config } from '../config/env';
import { logger } from '../config/logger';

// ── Constants ────────────────────────────────────────────
const SALT_ROUNDS = 12;
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

// ── Helper: set refresh token cookie ─────────────────────
function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

// ── Helper: clear refresh token cookie ───────────────────
function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
}

// ── Helper: generate safe token hash ─────────────────────
function generateSafeToken(): { raw: string; hashed: string } {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
}

// ── POST /api/auth/register ───────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role = 'CUSTOMER', storeName } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: 'CUSTOMER' | 'VENDOR';
    storeName?: string;
  };

  // Fail fast — validate role/storeName consistency
  if (role === 'VENDOR' && !storeName?.trim()) {
    throw new AppError('Vendor qeydiyyatı üçün mağaza adı tələb olunur', 400, 'VALIDATION_ERROR');
  }

  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError('Bu email ilə hesab artıq mövcuddur', 409, 'EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate email verification token
  const { raw: verifyTokenRaw, hashed: verifyTokenHashed } = generateSafeToken();

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      verifyToken: verifyTokenHashed,
      ...(role === 'VENDOR' && storeName
        ? {
            vendor: {
              create: {
                storeName: storeName.trim(),
                slug: slugify(storeName),
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  // Send verification email (non-blocking — don't fail registration if email fails)
  const verifyUrl = `${config.CLIENT_URL}/verify-email/${verifyTokenRaw}`;
  sendEmail({
    to: user.email,
    subject: 'ShopFlow — Email Doğrulama',
    html: buildVerifyEmailHtml(user.name, verifyUrl),
  }).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.warn('[sendEmail] verify email failed', { message });
  });

  successResponse(res, {
    statusCode: 201,
    message: 'Qeydiyyat uğurludur. Zəhmət olmasa emailinizi doğrulayın.',
    data: user,
  });
});

// ── POST /api/auth/login ──────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      isActive: true,
      isVerified: true,
      avatar: true,
    },
  });

  if (!user || !user.password) {
    throw new AppError('Email və ya şifrə yanlışdır', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Hesabınız deaktiv edilib. Dəstəklə əlaqə saxlayın.', 403, 'ACCOUNT_DISABLED');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError('Email və ya şifrə yanlışdır', 401, 'INVALID_CREDENTIALS');
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Persist refresh token hash to DB
  const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh, lastLoginAt: new Date() },
  });

  setRefreshTokenCookie(res, refreshToken);

  successResponse(res, {
    message: 'Uğurla daxil oldunuz',
    data: {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    },
  });
});

// ── POST /api/auth/logout ─────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

  if (refreshToken) {
    const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');
    // Clear refresh token from DB (ignore if user not found)
    await prisma.user.updateMany({
      where: { refreshToken: hashedRefresh },
      data: { refreshToken: null },
    });
  }

  clearRefreshTokenCookie(res);
  successResponse(res, { message: 'Uğurla çıxış etdiniz' });
});

// ── POST /api/auth/refresh-token ──────────────────────────
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

  if (!token) {
    throw new AppError('Refresh token tapılmadı', 401, 'UNAUTHORIZED');
  }

  // Verify token signature first
  const decoded = verifyRefreshToken(token);

  // Check DB for token match
  const hashedRefresh = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: { id: decoded.userId, refreshToken: hashedRefresh },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user) {
    clearRefreshTokenCookie(res);
    throw new AppError('Refresh token etibarsızdır', 401, 'INVALID_TOKEN');
  }

  if (!user.isActive) {
    clearRefreshTokenCookie(res);
    throw new AppError('Hesab deaktiv edilib', 403, 'ACCOUNT_DISABLED');
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // Rotate refresh token
  const newHashedRefresh = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newHashedRefresh },
  });

  setRefreshTokenCookie(res, newRefreshToken);
  successResponse(res, {
    message: 'Token yeniləndi',
    data: { accessToken: newAccessToken },
  });
});

// ── POST /api/auth/google ─────────────────────────────────
export const googleAuth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body as { idToken: string };

  if (!idToken) {
    throw new AppError('Google ID token tələb olunur', 400, 'VALIDATION_ERROR');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.sub) {
    throw new AppError('Google token etibarsızdır', 401, 'INVALID_TOKEN');
  }

  const { email, name, picture, sub: googleId } = payload;

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isActive: true,
      isVerified: true,
      googleId: true,
    },
  });

  if (!user) {
    // New Google user — register
    user = await prisma.user.create({
      data: {
        name: name ?? email.split('@')[0],
        email,
        googleId,
        avatar: picture,
        isVerified: true, // Google accounts are pre-verified
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        isVerified: true,
        googleId: true,
      },
    });
  } else if (!user.googleId) {
    // Existing email user — link Google account
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, isVerified: true, avatar: user.avatar ?? picture },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        isVerified: true,
        googleId: true,
      },
    });
  }

  if (!user.isActive) {
    throw new AppError('Hesabınız deaktiv edilib', 403, 'ACCOUNT_DISABLED');
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh, lastLoginAt: new Date() },
  });

  setRefreshTokenCookie(res, refreshToken);
  successResponse(res, {
    message: 'Google ilə giriş uğurludur',
    data: {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    },
  });
});

// ── POST /api/auth/forgot-password ───────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, name: true, email: true },
  });

  // Always return 200 to prevent email enumeration
  if (!user) {
    successResponse(res, {
      message: 'Əgər bu email mövcuddursa, şifrə sıfırlama linki göndərilib.',
    });
    return;
  }

  const { raw: resetTokenRaw, hashed: resetTokenHashed } = generateSafeToken();
  const resetTokenExp = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: resetTokenHashed, resetTokenExp },
  });

  const resetUrl = `${config.CLIENT_URL}/reset-password/${resetTokenRaw}`;
  await sendEmail({
    to: user.email,
    subject: 'ShopFlow — Şifrəni Sıfırla',
    html: buildResetPasswordHtml(user.name, resetUrl),
  });

  successResponse(res, {
    message: 'Əgər bu email mövcuddursa, şifrə sıfırlama linki göndərilib.',
  });
});

// ── POST /api/auth/reset-password/:token ─────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params as { token: string };
  const { password } = req.body as { password: string };

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExp: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!user) {
    throw new AppError('Token etibarsızdır və ya müddəti bitib', 400, 'INVALID_TOKEN');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
      refreshToken: null, // invalidate all sessions
    },
  });

  clearRefreshTokenCookie(res);
  successResponse(res, { message: 'Şifrəniz uğurla yeniləndi. Yenidən daxil olun.' });
});

// ── GET /api/auth/verify-email/:token ────────────────────
export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params as { token: string };

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: { verifyToken: hashedToken },
    select: { id: true, isVerified: true },
  });

  if (!user) {
    throw new AppError('Doğrulama tokeni etibarsızdır', 400, 'INVALID_TOKEN');
  }

  if (user.isVerified) {
    successResponse(res, { message: 'Email artıq doğrulanmışdır.' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null },
  });

  successResponse(res, { message: 'Email uğurla doğrulandı! İndi daxil ola bilərsiniz.' });
});

// ── GET /api/auth/me ──────────────────────────────────────
export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('İstifadəçi tapılmadı', 401, 'UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isVerified: true,
      lastLoginAt: true,
      createdAt: true,
      password: true,
      vendor: {
        select: {
          id: true,
          storeName: true,
          slug: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('İstifadəçi tapılmadı', 404, 'NOT_FOUND');
  }

  // Expose whether the account has a local password (Google-only accounts have
  // none) so the settings UI can hide the change-password form. Never leak the hash.
  const { password, ...safeUser } = user;
  successResponse(res, {
    message: 'İstifadəçi məlumatı',
    data: { ...safeUser, hasPassword: Boolean(password) },
  });
});
