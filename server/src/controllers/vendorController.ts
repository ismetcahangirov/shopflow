// src/controllers/vendorController.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

export const applyVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

  const existing = await prisma.vendor.findUnique({ where: { userId } });
  if (existing) throw new AppError('Artıq satıcı müraciətiniz var', 409, 'ALREADY_APPLIED');

  const { storeName, description, phone } = req.body as { storeName: string; description?: string; phone?: string };

  const slug = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  const vendor = await prisma.vendor.create({
    data: { storeName, slug, description: description ?? null, phone: phone ?? null, userId },
  });

  await prisma.user.update({ where: { id: userId }, data: { role: 'VENDOR' } });

  logger.info(`Vendor application created: ${vendor.storeName} by user ${userId}`);
  successResponse(res, { statusCode: 201, message: 'Satıcı müraciətiniz qəbul edildi', data: vendor });
});

export const getVendors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const status = req.query.status as string | undefined;

  const where: Prisma.VendorWhereInput = {};
  if (status) where.status = status as Prisma.EnumVendorStatusFilter['equals'];

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vendor.count({ where }),
  ]);

  successResponse(res, {
    message: 'Satıcılar uğurla gətirildi',
    data: vendors.map((v) => ({ ...v, totalSales: Number(v.totalSales), productCount: v._count.products, _count: undefined })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateVendorStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const vendorId = req.params.id as string;
  const { status: newStatus } = req.body as { status: string; note?: string };

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new AppError('Satıcı tapılmadı', 404, 'NOT_FOUND');

  const oldStatus = vendor.status;

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: newStatus as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' },
  });

  if (newStatus === 'REJECTED' && vendor.userId) {
    await prisma.user.update({ where: { id: vendor.userId }, data: { role: 'CUSTOMER' } });
  }

  logger.info(`Vendor ${vendorId} status changed from ${oldStatus} to ${newStatus}`);
  successResponse(res, { message: 'Satıcı statusu yeniləndi', data: { id: vendorId, status: newStatus } });
});

export const getMyVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: { _count: { select: { products: true } } },
  });

  if (!vendor) throw new AppError('Satıcı profili tapılmadı', 404, 'VENDOR_NOT_FOUND');

  successResponse(res, { message: 'Satıcı profiliniz', data: { ...vendor, totalSales: Number(vendor.totalSales), productCount: vendor._count.products, _count: undefined } });
});

export const updateMyVendor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

  const { storeName, description, phone, logo, banner, address, commission } = req.body as {
    storeName?: string; description?: string; phone?: string; logo?: string; banner?: string; address?: string; commission?: number;
  };

  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) throw new AppError('Satıcı profili tapılmadı', 404, 'VENDOR_NOT_FOUND');

  const data: Record<string, string | number | null> = {};
  if (storeName !== undefined) { data.storeName = storeName; data.slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80); }
  if (description !== undefined) data.description = description;
  if (phone !== undefined) data.phone = phone;
  if (logo !== undefined) data.logo = logo;
  if (banner !== undefined) data.banner = banner;
  if (address !== undefined) data.address = address;
  if (commission !== undefined) data.commission = commission;

  const updated = await prisma.vendor.update({ where: { id: vendor.id }, data });
  logger.info(`Vendor profile updated for user ${userId}`);
  successResponse(res, { message: 'Satıcı profili yeniləndi', data: updated });
});

export const getMyVendorStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

  const vendor = await prisma.vendor.findUnique({ where: { userId }, select: { id: true } });
  if (!vendor) throw new AppError('Satıcı profili tapılmadı', 404, 'VENDOR_NOT_FOUND');

  const [totalProducts, totalOrdersResult, revenueResult, pendingOrders, avgRatingResult] = await Promise.all([
    prisma.product.count({ where: { vendorId: vendor.id, isActive: true } }),
    prisma.orderItem.aggregate({
      where: { product: { vendorId: vendor.id }, order: { paymentStatus: 'PAID' } },
      _count: true,
    }),
    prisma.orderItem.aggregate({
      where: { product: { vendorId: vendor.id }, order: { paymentStatus: 'PAID' } },
      _sum: { total: true },
    }),
    prisma.orderItem.count({
      where: { product: { vendorId: vendor.id }, order: { status: 'PENDING' } },
    }),
    prisma.review.aggregate({
      where: { product: { vendorId: vendor.id }, isApproved: true },
      _avg: { rating: true },
    }),
  ]);

  successResponse(res, {
    message: 'Satıcı statistikaları',
    data: {
      totalProducts,
      totalOrders: totalOrdersResult._count,
      totalRevenue: Number(revenueResult._sum.total ?? 0),
      pendingOrders,
      avgRating: avgRatingResult._avg.rating ?? 0,
    },
  });
});
