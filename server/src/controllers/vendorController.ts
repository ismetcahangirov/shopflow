// src/controllers/vendorController.ts
import { Request, Response } from 'express';
import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { uploadToCloudinary } from '../middleware/uploadMiddleware';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
];

/** Resolve the calling user's vendor id, or throw 404 if they have no vendor profile. */
async function resolveVendorId(userId: string): Promise<string> {
  const vendor = await prisma.vendor.findUnique({ where: { userId }, select: { id: true } });
  if (!vendor) throw new AppError('Satıcı profili tapılmadı', 404, 'VENDOR_NOT_FOUND');
  return vendor.id;
}

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

// ─── Vendor-scoped dashboard ──────────────────────────────────────────────────

export const getMyVendorDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
  const vendorId = await resolveVendorId(userId);

  const days = Math.min(365, Math.max(1, parseInt(req.query.period as string) || 30));
  const since = new Date(Date.now() - days * 86400000);

  const [
    totalProducts,
    paidItems,
    revenueResult,
    pendingOrders,
    avgRatingResult,
    revenueData,
    topProducts,
    lowStockProducts,
    recentOrdersRaw,
    ordersByStatusRaw,
  ] = await Promise.all([
    prisma.product.count({ where: { vendorId, isActive: true } }),
    prisma.orderItem.aggregate({
      where: { product: { vendorId }, order: { paymentStatus: 'PAID' } },
      _count: true,
    }),
    prisma.orderItem.aggregate({
      where: { product: { vendorId }, order: { paymentStatus: 'PAID' } },
      _sum: { total: true },
    }),
    prisma.orderItem.count({ where: { product: { vendorId }, order: { status: 'PENDING' } } }),
    prisma.review.aggregate({ where: { product: { vendorId }, isApproved: true }, _avg: { rating: true } }),
    prisma.$queryRaw<{ date: string; revenue: number | null; orders: number }[]>`
      SELECT DATE(o."createdAt") as date, SUM(oi.total) as revenue, COUNT(DISTINCT o.id)::int as orders
      FROM order_items oi
      JOIN products p ON p.id = oi."productId"
      JOIN orders o ON o.id = oi."orderId"
      WHERE p."vendorId" = ${vendorId} AND o."paymentStatus" = 'PAID' AND o."createdAt" >= ${since}
      GROUP BY DATE(o."createdAt")
      ORDER BY date ASC
    `,
    prisma.$queryRaw<{ id: string; name: string; sales_count: number; revenue: number | null }[]>`
      SELECT p.id, p.name, SUM(oi.quantity)::int as sales_count, SUM(oi.total) as revenue
      FROM order_items oi
      JOIN products p ON p.id = oi."productId"
      JOIN orders o ON o.id = oi."orderId"
      WHERE p."vendorId" = ${vendorId} AND o."paymentStatus" = 'PAID' AND o."createdAt" >= ${since}
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 10
    `,
    prisma.$queryRaw<{ id: string; name: string; stock: number; lowStockAlert: number }[]>`
      SELECT id, name, stock, "lowStockAlert"
      FROM products
      WHERE "vendorId" = ${vendorId} AND "isActive" = true AND stock <= "lowStockAlert"
      ORDER BY stock ASC
      LIMIT 10
    `,
    prisma.order.findMany({
      where: { items: { some: { product: { vendorId } } } },
      include: {
        user: { select: { name: true } },
        items: { where: { product: { vendorId } }, select: { total: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { items: { some: { product: { vendorId } } } },
      _count: { status: true },
    }),
  ]);

  const totalOrders = paidItems._count;
  const totalRevenue = Number(revenueResult._sum.total ?? 0);

  successResponse(res, {
    message: 'Satıcı dashboard məlumatları',
    data: {
      summary: {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        avgRating: avgRatingResult._avg.rating ?? 0,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      revenueChart: revenueData.map((r) => ({ date: r.date, revenue: Number(r.revenue ?? 0), orders: Number(r.orders) })),
      topProducts: topProducts.map((p) => ({ id: p.id, name: p.name, salesCount: Number(p.sales_count), revenue: Number(p.revenue ?? 0) })),
      lowStockProducts: lowStockProducts.map((p) => ({ id: p.id, name: p.name, stock: p.stock, lowStockAlert: p.lowStockAlert })),
      recentOrders: recentOrdersRaw.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        vendorSubtotal: o.items.reduce((sum, it) => sum + Number(it.total), 0),
        status: o.status,
        createdAt: o.createdAt,
        user: { name: o.user.name },
      })),
      ordersByStatus: Object.fromEntries(ordersByStatusRaw.map((o) => [o.status, o._count.status])),
    },
  });
});

// ─── Vendor-scoped orders ─────────────────────────────────────────────────────

export const getMyVendorOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
  const vendorId = await resolveVendorId(userId);

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const status = req.query.status as string | undefined;

  const where: Prisma.OrderWhereInput = { items: { some: { product: { vendorId } } } };
  if (status && ORDER_STATUSES.includes(status as OrderStatus)) {
    where.status = status as OrderStatus;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { where: { product: { vendorId } }, select: { total: true, quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  successResponse(res, {
    message: 'Satıcı sifarişləri',
    data: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      user: o.user,
      vendorSubtotal: o.items.reduce((sum, it) => sum + Number(it.total), 0),
      vendorItemCount: o.items.reduce((sum, it) => sum + it.quantity, 0),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ─── Vendor-scoped sales time-series ──────────────────────────────────────────

export const getMyVendorSales = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
  const vendorId = await resolveVendorId(userId);

  const { startDate, endDate, groupBy = 'day' } = req.query;
  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 86400000);
  const end = endDate ? new Date(endDate as string) : new Date();
  const interval = groupBy === 'month' ? 'month' : groupBy === 'year' ? 'year' : 'day';

  const periodExpr =
    interval === 'month'
      ? Prisma.sql`DATE_TRUNC('month', o."createdAt")`
      : interval === 'year'
        ? Prisma.sql`DATE_TRUNC('year', o."createdAt")`
        : Prisma.sql`DATE(o."createdAt")`;

  const sales = await prisma.$queryRaw<{ period: Date; revenue: number | null; orders: number }[]>(Prisma.sql`
    SELECT ${periodExpr} as period, SUM(oi.total) as revenue, COUNT(DISTINCT o.id)::int as orders
    FROM order_items oi
    JOIN products p ON p.id = oi."productId"
    JOIN orders o ON o.id = oi."orderId"
    WHERE p."vendorId" = ${vendorId} AND o."paymentStatus" = 'PAID' AND o."createdAt" >= ${start} AND o."createdAt" <= ${end}
    GROUP BY period
    ORDER BY period ASC
  `);

  successResponse(res, {
    message: 'Satıcı satış məlumatları',
    data: sales.map((s) => ({ period: new Date(s.period).toISOString(), revenue: Number(s.revenue ?? 0), orders: Number(s.orders) })),
  });
});

// ─── Store logo / banner upload ───────────────────────────────────────────────

function uploadVendorImage(field: 'logo' | 'banner'): ReturnType<typeof asyncHandler> {
  return asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Satıcı profili tapılmadı', 404, 'VENDOR_NOT_FOUND');
    if (!req.file) throw new AppError('Fayl tələb olunur', 400, 'NO_FILE');

    const { secure_url } = await uploadToCloudinary(req.file.buffer, 'vendors');
    const updated = await prisma.vendor.update({ where: { id: vendor.id }, data: { [field]: secure_url } });

    logger.info(`Vendor ${field} updated for user ${userId}`);
    successResponse(res, { message: 'Şəkil yeniləndi', data: { ...updated, totalSales: Number(updated.totalSales) } });
  });
}

export const uploadVendorLogo = uploadVendorImage('logo');
export const uploadVendorBanner = uploadVendorImage('banner');
