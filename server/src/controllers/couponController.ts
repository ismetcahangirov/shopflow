// src/controllers/couponController.ts
// Coupon Controller — GET (list for Admin), POST (create), PUT (update), DELETE (delete), POST (validate for Customer)

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

// ── Shared formatting helper ──────────────────────────────
interface FormattedCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

function formatCoupon(coupon: {
  id: string;
  code: string;
  type: string;
  value: Prisma.Decimal;
  minOrderValue: Prisma.Decimal | null;
  maxDiscount: Prisma.Decimal | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}): FormattedCoupon {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    isActive: coupon.isActive,
    startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
    createdAt: coupon.createdAt.toISOString(),
  };
}

// ── GET /api/coupons ──────────────────────────────────────
export const getCoupons = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const {
      page: pageStr = '1',
      limit: limitStr = '20',
      search,
    } = req.query as Record<string, string | undefined>;

    const page = Math.max(1, parseInt(pageStr, 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitStr, 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.CouponWhereInput = {};

    if (search) {
      where.code = {
        contains: search.trim().toUpperCase(),
      };
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    const formattedCoupons = coupons.map(formatCoupon);

    successResponse(res, {
      message: 'Kuponlar uğurla gətirildi',
      data: { coupons: formattedCoupons },
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  },
);

// ── POST /api/coupons ─────────────────────────────────────
export const createCoupon = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      maxUses,
      isActive = true,
      startsAt,
      expiresAt,
    } = req.body as {
      code: string;
      type: 'PERCENTAGE' | 'FIXED_AMOUNT';
      value: number;
      minOrderValue?: number | null;
      maxDiscount?: number | null;
      maxUses?: number | null;
      isActive?: boolean;
      startsAt?: string | null;
      expiresAt?: string | null;
    };

    const uppercaseCode = code.trim().toUpperCase();

    // Check if code is unique
    const existing = await prisma.coupon.findUnique({
      where: { code: uppercaseCode },
    });

    if (existing) {
      throw new AppError('Bu kupon kodu artıq mövcuddur', 409, 'COUPON_ALREADY_EXISTS');
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: uppercaseCode,
        type,
        value: new Prisma.Decimal(value),
        minOrderValue: minOrderValue !== undefined && minOrderValue !== null ? new Prisma.Decimal(minOrderValue) : null,
        maxDiscount: maxDiscount !== undefined && maxDiscount !== null ? new Prisma.Decimal(maxDiscount) : null,
        maxUses: maxUses ?? null,
        isActive,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    logger.info(`Coupon created: ${coupon.code} by admin ${req.user?.id}`);

    successResponse(res, {
      statusCode: 201,
      message: 'Kupon uğurla yaradıldı',
      data: { coupon: formatCoupon(coupon) },
    });
  },
);

// ── PUT /api/coupons/:id ──────────────────────────────────
export const updateCoupon = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      maxUses,
      isActive,
      startsAt,
      expiresAt,
    } = req.body as {
      code?: string;
      type?: 'PERCENTAGE' | 'FIXED_AMOUNT';
      value?: number;
      minOrderValue?: number | null;
      maxDiscount?: number | null;
      maxUses?: number | null;
      isActive?: boolean;
      startsAt?: string | null;
      expiresAt?: string | null;
    };

    // Find the coupon
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Kupon tapılmadı', 404, 'COUPON_NOT_FOUND');
    }

    // Check code uniqueness if code is changed
    let uppercaseCode = existing.code;
    if (code !== undefined) {
      uppercaseCode = code.trim().toUpperCase();
      if (uppercaseCode !== existing.code) {
        const conflict = await prisma.coupon.findUnique({
          where: { code: uppercaseCode },
        });
        if (conflict) {
          throw new AppError('Bu kupon kodu artıq mövcuddur', 409, 'COUPON_ALREADY_EXISTS');
        }
      }
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: uppercaseCode,
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value: new Prisma.Decimal(value) }),
        ...(minOrderValue !== undefined && {
          minOrderValue: minOrderValue !== null ? new Prisma.Decimal(minOrderValue) : null,
        }),
        ...(maxDiscount !== undefined && {
          maxDiscount: maxDiscount !== null ? new Prisma.Decimal(maxDiscount) : null,
        }),
        ...(maxUses !== undefined && { maxUses }),
        ...(isActive !== undefined && { isActive }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    logger.info(`Coupon updated: ${updatedCoupon.code} by admin ${req.user?.id}`);

    successResponse(res, {
      message: 'Kupon uğurla yeniləndi',
      data: { coupon: formatCoupon(updatedCoupon) },
    });
  },
);

// ── DELETE /api/coupons/:id ───────────────────────────────
export const deleteCoupon = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Kupon tapılmadı', 404, 'COUPON_NOT_FOUND');
    }

    await prisma.coupon.delete({
      where: { id },
    });

    logger.info(`Coupon deleted: ${existing.code} by admin ${req.user?.id}`);

    successResponse(res, {
      message: 'Kupon uğurla silindi',
    });
  },
);

// ── POST /api/coupons/validate ───────────────────────────
export const validateCoupon = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { code, subtotal } = req.body as { code: string; subtotal: number };

    const uppercaseCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: uppercaseCode },
    });

    if (!coupon) {
      throw new AppError('Kupon tapılmadı', 404, 'COUPON_NOT_FOUND');
    }

    // Validation checks
    if (!coupon.isActive) {
      throw new AppError('Kupon aktiv deyil', 400, 'COUPON_INACTIVE');
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      throw new AppError('Kuponun istifadə müddəti hələ başlamayıb', 400, 'COUPON_NOT_STARTED');
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new AppError('Kuponun istifadə müddəti bitib', 400, 'COUPON_EXPIRED');
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new AppError('Kuponun maksimum istifadə sayına çatıb', 400, 'COUPON_LIMIT_REACHED');
    }

    const minOrderVal = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0;
    if (subtotal < minOrderVal) {
      throw new AppError(
        `Kupondan istifadə etmək üçün minimum sifariş məbləği ${minOrderVal} AZN olmalıdır`,
        400,
        'COUPON_MIN_ORDER_VALUE'
      );
    }

    // Calculate discount
    let discount = 0;
    const valueNum = Number(coupon.value);

    if (coupon.type === 'PERCENTAGE') {
      discount = subtotal * (valueNum / 100);
      if (coupon.maxDiscount !== null) {
        const maxDiscountNum = Number(coupon.maxDiscount);
        discount = Math.min(discount, maxDiscountNum);
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discount = valueNum;
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, subtotal);
    // Round to 2 decimals
    discount = Number(discount.toFixed(2));

    successResponse(res, {
      message: 'Kupon uğurla tətbiq olundu',
      data: {
        coupon: formatCoupon(coupon),
        discount,
      },
    });
  },
);
