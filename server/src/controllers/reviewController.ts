// src/controllers/reviewController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

export const getReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = req.query.productId as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const where: Record<string, unknown> = { isApproved: true };
    if (productId) where.productId = productId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { ...where, productId },
      _count: { rating: true },
    });

    const ratingDist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const d of distribution) {
      ratingDist[String(d.rating)] = d._count.rating;
    }

    const avgRating = productId
      ? await prisma.review.aggregate({
          where: { productId, isApproved: true },
          _avg: { rating: true },
        })
      : null;

    successResponse(res, {
      message: 'Rəylər uğurla gətirildi',
      data: reviews.map((r) => ({
        ...r,
        rating: r.rating,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      ...(productId && {
        extra: {
          summary: {
            avgRating: avgRating?._avg.rating ?? 0,
            totalCount: total,
            distribution: ratingDist,
          },
        },
      }),
    });
  },
);

export const createReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const { productId, rating, title, body } = req.body as {
      productId: string;
      rating: number;
      title?: string;
      body: string;
    };

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new AppError('Bu məhsula artıq rəy yazmısınız', 409, 'ALREADY_REVIEWED');

    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['DELIVERED', 'SHIPPED'] },
        items: { some: { productId } },
      },
    });

    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          userId,
          productId,
          rating,
          title: title ?? null,
          body,
          isVerified: !!hasPurchased,
          isApproved: false,
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      const stats = await tx.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          avgRating: stats._avg.rating ?? 0,
          reviewCount: stats._count.rating,
        },
      });

      return r;
    });

    logger.info(`Review created for product ${productId} by user ${userId}`);

    successResponse(res, {
      statusCode: 201,
      message: 'Rəyiniz moderasiya üçün göndərildi',
      data: review,
    });
  },
);

export const approveReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const reviewId = req.params.id as string;
    const { isApproved } = req.body as { isApproved: boolean };

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError('Rəy tapılmadı', 404, 'NOT_FOUND');

    await prisma.$transaction(async (tx) => {
      await tx.review.update({
        where: { id: reviewId },
        data: { isApproved },
      });

      const stats = await tx.review.aggregate({
        where: { productId: review.productId, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: review.productId },
        data: {
          avgRating: stats._avg.rating ?? 0,
          reviewCount: stats._count.rating,
        },
      });
    });

    logger.info(`Review ${reviewId} ${isApproved ? 'approved' : 'rejected'}`);

    successResponse(res, { message: isApproved ? 'Rəy təsdiqləndi' : 'Rəy rədd edildi' });
  },
);

export const deleteReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const reviewId = req.params.id as string;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError('Rəy tapılmadı', 404, 'NOT_FOUND');

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });

      const stats = await tx.review.aggregate({
        where: { productId: review.productId, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: review.productId },
        data: {
          avgRating: stats._avg.rating ?? 0,
          reviewCount: stats._count.rating,
        },
      });
    });

    logger.info(`Review ${reviewId} deleted`);

    successResponse(res, { message: 'Rəy silindi' });
  },
);
