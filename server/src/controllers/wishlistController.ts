// src/controllers/wishlistController.ts
// Wishlist Controller — GET (list), POST (add), DELETE (remove)

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

export const getWishlist = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isMain: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    successResponse(res, {
      message: 'İstək siyahısı uğurla gətirildi',
      data: items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.price),
          stock: item.product.stock,
          isActive: item.product.isActive,
          image: item.product.images[0]?.url ?? null,
        },
      })),
    });
  },
);

export const addToWishlist = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const { productId } = req.body as { productId: string };

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      throw new AppError('Məhsul artıq istək siyahısındadır', 409, 'ALREADY_EXISTS');
    }

    const item = await prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          include: { images: { where: { isMain: true }, take: 1 } },
        },
      },
    });

    logger.info(`Product ${productId} added to wishlist for user ${userId}`);

    successResponse(res, {
      statusCode: 201,
      message: 'Məhsul istək siyahısına əlavə edildi',
      data: {
        id: item.id,
        createdAt: item.createdAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.price),
          stock: item.product.stock,
          image: item.product.images[0]?.url ?? null,
        },
      },
    });
  },
);

export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const productId = req.params.productId as string;

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!existing) {
      throw new AppError('Məhsul istək siyahısında tapılmadı', 404, 'NOT_FOUND');
    }

    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });

    logger.info(`Product ${productId} removed from wishlist for user ${userId}`);

    successResponse(res, {
      message: 'Məhsul istək siyahısından silindi',
    });
  },
);
