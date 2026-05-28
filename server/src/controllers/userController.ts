// src/controllers/userController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { uploadToCloudinary } from '../middleware/uploadMiddleware';

export const getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;
  const isActive = req.query.isActive;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, avatar: true,
        isActive: true, isVerified: true, createdAt: true, lastLoginAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  successResponse(res, {
    message: 'İstifadəçilər uğurla gətirildi',
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

  const { name, email } = req.body as { name?: string; email?: string };

  const data: Record<string, string> = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      throw new AppError('Bu email artıq istifadə olunur', 409, 'EMAIL_EXISTS');
    }
    data.email = email;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('Heç bir məlumat dəyişdirilmədi', 400, 'NO_DATA');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, isVerified: true, isActive: true },
  });

  logger.info(`Profile updated for user ${userId}`);
  successResponse(res, { message: 'Profil uğurla yeniləndi', data: user });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

  const { currentPassword, newPassword, confirmPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };

  if (newPassword !== confirmPassword) {
    throw new AppError('Yeni şifrələr uyğun gəlmir', 400, 'PASSWORD_MISMATCH');
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user?.password) {
    throw new AppError('Google hesabı ilə daxil olmusunuz', 400, 'NO_PASSWORD');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError('Cari şifrə yanlışdır', 400, 'WRONG_PASSWORD');

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  logger.info(`Password changed for user ${userId}`);
  successResponse(res, { message: 'Şifrə uğurla dəyişdirildi' });
});

export const updateAvatar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

  if (!req.file) throw new AppError('Şəkil faylı tələb olunur', 400, 'FILE_REQUIRED');

  const result = await uploadToCloudinary(req.file.buffer, 'avatars');

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: result.secure_url },
    select: { avatar: true },
  });

  logger.info(`Avatar updated for user ${userId}`);
  successResponse(res, { message: 'Avatar uğurla yeniləndi', data: { avatar: user.avatar } });
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const targetId = req.params.id as string;
  const { isActive } = req.body as { isActive: boolean };

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new AppError('İstifadəçi tapılmadı', 404, 'NOT_FOUND');

  if (user.role === 'ADMIN') throw new AppError('Admin istifadəçinin statusu dəyişdirilə bilməz', 403, 'FORBIDDEN');

  await prisma.user.update({ where: { id: targetId }, data: { isActive } });

  logger.info(`User ${targetId} status changed to ${isActive}`);
  successResponse(res, { message: isActive ? 'İstifadəçi aktivləşdirildi' : 'İstifadəçi deaktiv edildi' });
});
