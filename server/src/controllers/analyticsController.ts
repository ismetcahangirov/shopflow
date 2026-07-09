// src/controllers/analyticsController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';

export const getDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { period } = req.query;
  const days = Math.min(365, Math.max(1, parseInt(period as string) || 30));
  const since = new Date(Date.now() - days * 86400000);

  const [totalRevenue, totalOrders, totalCustomers, totalProducts] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  const revenueData = await prisma.$queryRaw<{ date: string; revenue: number; orders: bigint }[]>`
    SELECT DATE("createdAt") as date, SUM(total) as revenue, COUNT(*)::int as orders
    FROM orders
    WHERE "paymentStatus" = 'PAID' AND "createdAt" >= ${since}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const topProducts = await prisma.$queryRaw<{ id: string; name: string; sales_count: bigint; revenue: number }[]>`
    SELECT p.id, p.name, SUM(oi.quantity)::int as sales_count, SUM(oi.total) as revenue
    FROM order_items oi
    JOIN products p ON p.id = oi."productId"
    JOIN orders o ON o.id = oi."orderId"
    WHERE o."paymentStatus" = 'PAID' AND o."createdAt" >= ${since}
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 10
  `;

  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const recentOrders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  successResponse(res, {
    message: 'Dashboard məlumatları',
    data: {
      summary: {
        totalRevenue: Number(totalRevenue._sum.total ?? 0),
        totalOrders,
        totalCustomers,
        totalProducts,
        avgOrderValue: totalOrders > 0 ? Number(totalRevenue._sum.total ?? 0) / totalOrders : 0,
      },
      revenueChart: revenueData.map((r) => ({ date: r.date, revenue: Number(r.revenue), orders: Number(r.orders) })),
      topProducts: topProducts.map((p) => ({ id: p.id, name: p.name, salesCount: Number(p.sales_count), revenue: Number(p.revenue) })),
      ordersByStatus: Object.fromEntries(ordersByStatus.map((o) => [o.status, o._count.status])),
      recentOrders: recentOrders.map((o) => ({
        id: o.id, orderNumber: o.orderNumber, total: Number(o.total), status: o.status, createdAt: o.createdAt,
        user: { name: o.user.name },
      })),
    },
  });
});

export const getSalesChart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 86400000);
  const end = endDate ? new Date(endDate as string) : new Date();
  const interval = groupBy === 'month' ? 'month' : groupBy === 'year' ? 'year' : 'day';

  let sales: { period: string; revenue: number; orders: bigint }[];

  if (interval === 'month') {
    sales = await prisma.$queryRaw<{ period: string; revenue: number; orders: bigint }[]>`
      SELECT DATE_TRUNC('month', "createdAt") as period,
             SUM(total) as revenue,
             COUNT(*)::int as orders
      FROM orders
      WHERE "paymentStatus" = 'PAID' AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY period
      ORDER BY period ASC
    `;
  } else if (interval === 'year') {
    sales = await prisma.$queryRaw<{ period: string; revenue: number; orders: bigint }[]>`
      SELECT DATE_TRUNC('year', "createdAt") as period,
             SUM(total) as revenue,
             COUNT(*)::int as orders
      FROM orders
      WHERE "paymentStatus" = 'PAID' AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY period
      ORDER BY period ASC
    `;
  } else {
    sales = await prisma.$queryRaw<{ period: string; revenue: number; orders: bigint }[]>`
      SELECT DATE("createdAt") as period,
             SUM(total) as revenue,
             COUNT(*)::int as orders
      FROM orders
      WHERE "paymentStatus" = 'PAID' AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY period
      ORDER BY period ASC
    `;
  }

  successResponse(res, {
    message: 'Satış məlumatları',
    data: sales.map((s) => ({ period: new Date(s.period).toISOString(), revenue: Number(s.revenue), orders: Number(s.orders) })),
  });
});
