// src/middleware/roleMiddleware.ts
// Role-based authorization — restricts access to specific user roles

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

type Role = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('İstifadəçi məlumatı tapılmadı', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Bu əməliyyat üçün "${roles.join(' və ya ')}" rolu tələb olunur`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}

export const requireApprovedVendor = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('İstifadəçi məlumatı tapılmadı', 401, 'UNAUTHORIZED'));
    }

    if (req.user.role !== 'VENDOR') {
      return next(new AppError('Satıcı hesabı tələb olunur', 403, 'FORBIDDEN'));
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      select: { status: true },
    });

    if (!vendor) {
      return next(new AppError('Satıcı profili tapılmadı', 404, 'VENDOR_NOT_FOUND'));
    }
    if (vendor.status !== 'APPROVED') {
      return next(new AppError('Satıcı hesabınız hələ təsdiqlənməyib', 403, 'VENDOR_NOT_APPROVED'));
    }
    next();
  },
);
