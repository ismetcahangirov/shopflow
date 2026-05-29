// src/controllers/orderController.ts
// Order Controller — create, list, get (admin), get my orders, get single, update status, cancel

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { logger } from '../config/logger';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { generateOrderNumber } from '../utils/generateOrderNumber';

interface CreateOrderInput {
  addressId: string;
  couponCode?: string;
  notes?: string;
}

const ORDER_INCLUDES = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  address: true,
  coupon: true,
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: { where: { isMain: true }, take: 1 },
        },
      },
    },
  },
  statusHistory: {
    orderBy: { createdAt: 'asc' as const },
  },
};

// ── POST /api/orders ──────────────────────────────────────
export const createOrder = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const { addressId, couponCode, notes } = req.body as CreateOrderInput;

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) throw new AppError('Ünvan tapılmadı', 404, 'NOT_FOUND');
    if (address.userId !== userId) throw new AppError('Bu ünvana giriş icazəniz yoxdur', 403, 'FORBIDDEN');

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Səbətiniz boşdur', 400, 'EMPTY_CART');
    }

    // Validate stock
    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new AppError(`"${item.product.name}" məhsulu artıq əlçatan deyil`, 422, 'PRODUCT_UNAVAILABLE');
      }
      if (item.product.stock < item.quantity) {
        throw new AppError(
          `"${item.product.name}" məhsulu stokda kifayət qədər yoxdur (mövcud: ${item.product.stock})`,
          422,
          'OUT_OF_STOCK',
        );
      }
    }

    let couponId: string | null = null;
    let discount: Prisma.Decimal = new Prisma.Decimal(0);

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });

      if (!coupon || !coupon.isActive) {
        throw new AppError('Kupon etibarsızdır', 422, 'COUPON_INVALID');
      }

      const now = new Date();
      if (coupon.startsAt && coupon.startsAt > now) {
        throw new AppError('Kupon hələ aktiv deyil', 422, 'COUPON_INVALID');
      }
      if (coupon.expiresAt && coupon.expiresAt < now) {
        throw new AppError('Kuponun müddəti bitib', 422, 'COUPON_EXPIRED');
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        throw new AppError('Kupon limiti dolub', 422, 'COUPON_EXHAUSTED');
      }

      const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
      const minOrder = Number(coupon.minOrderValue ?? 0);
      if (subtotal < minOrder) {
        throw new AppError(`Bu kupon üçün minimum sifariş ${minOrder} AZN olmalıdır`, 422, 'COUPON_MIN_ORDER');
      }

      if (coupon.type === 'PERCENTAGE') {
        discount = new Prisma.Decimal(((subtotal * Number(coupon.value)) / 100).toFixed(2));
        if (coupon.maxDiscount) {
          const maxDiscount = new Prisma.Decimal(coupon.maxDiscount);
          if (discount.greaterThan(maxDiscount)) {
            discount = maxDiscount;
          }
        }
      } else {
        discount = new Prisma.Decimal(coupon.value);
      }

      couponId = coupon.id;
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const shippingCost = subtotal >= 150 ? 0 : 5;
    const total = new Prisma.Decimal(subtotal).plus(shippingCost).minus(discount);

    if (total.lessThan(0)) {
      throw new AppError('Sifariş məbləği mənfi ola bilməz', 400, 'INVALID_TOTAL');
    }

    const orderNumber = await generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Deduct stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          couponId,
          subtotal,
          shippingCost,
          discount,
          total,
          notes: notes ?? null,
          paymentMethod: 'stripe',
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productSku: item.product.sku,
              quantity: item.quantity,
              price: item.product.price,
              total: new Prisma.Decimal(item.quantity).times(item.product.price),
            })),
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              note: 'Sifariş yaradıldı',
            },
          },
        },
        include: ORDER_INCLUDES,
      });

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    }, { maxWait: 10000, timeout: 20000 });

    logger.info(`Order ${order.orderNumber} created for user ${userId}`);

    successResponse(res, {
      statusCode: 201,
      message: 'Sifariş uğurla yaradıldı',
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        discount: Number(order.discount),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      },
    });
  },
);

// ── GET /api/orders (Admin) ────────────────────────────────
export const getOrders = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const status = req.query.status as string | undefined;
    const paymentStatus = req.query.paymentStatus as string | undefined;
    const search = req.query.search as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status as Prisma.EnumOrderStatusFilter['equals'];
    if (paymentStatus) where.paymentStatus = paymentStatus as Prisma.EnumPaymentStatusFilter['equals'];
    if (search) {
      where.orderNumber = { contains: search, mode: 'insensitive' };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(startDate);
      if (endDate) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    successResponse(res, {
      message: 'Sifarişlər uğurla gətirildi',
      data: orders.map((o) => ({
        ...o,
        total: Number(o.total),
        discount: Number(o.discount),
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        tax: Number(o.tax),
        itemCount: o._count.items,
        _count: undefined,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  },
);

// ── GET /api/orders/my ─────────────────────────────────────
export const getMyOrders = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const status = req.query.status as string | undefined;

    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = status as Prisma.EnumOrderStatusFilter['equals'];

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: { where: { isMain: true }, take: 1 },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    successResponse(res, {
      message: 'Sifarişləriniz uğurla gətirildi',
      data: orders.map((o) => ({
        ...o,
        total: Number(o.total),
        discount: Number(o.discount),
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        tax: Number(o.tax),
        items: o.items.map((item) => ({
          ...item,
          price: Number(item.price),
          total: Number(item.total),
          product: item.product
            ? {
                ...item.product,
                image: item.product.images[0]?.url ?? null,
                images: undefined,
              }
            : null,
        })),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  },
);

// ── GET /api/orders/:id ────────────────────────────────────
export const getOrder = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const orderId = req.params.id as string;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_INCLUDES,
    });

    if (!order) throw new AppError('Sifariş tapılmadı', 404, 'NOT_FOUND');

    if (req.user?.role !== 'ADMIN' && order.userId !== userId) {
      throw new AppError('Bu sifarişə giriş icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    successResponse(res, {
      message: 'Sifariş uğurla gətirildi',
      data: {
        ...order,
        total: Number(order.total),
        discount: Number(order.discount),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
          total: Number(item.total),
        })),
      },
    });
  },
);

// ── PATCH /api/orders/:id/status ───────────────────────────
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const orderId = req.params.id as string;
    const { status, trackingNumber, note } = req.body as {
      status: string;
      trackingNumber?: string;
      note?: string;
    };

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new AppError('Sifariş tapılmadı', 404, 'NOT_FOUND');

    const validStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Yanlış status', 400, 'INVALID_STATUS');
    }

    const updateData: Prisma.OrderUpdateInput = {
      status: status as Prisma.EnumOrderStatusFieldUpdateOperationsInput,
    };

    if (status === 'SHIPPED') {
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      updateData.shippedAt = new Date();
    }
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }
    if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancelReason = note ?? null;

      // If cancelled, restore stock
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });

      for (const item of orderItems) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: status as 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
          note: note ?? null,
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: ORDER_INCLUDES,
      });
    }, { maxWait: 10000, timeout: 20000 });

    logger.info(`Order ${order.orderNumber} status updated to ${status}`);

    successResponse(res, {
      message: 'Sifariş statusu yeniləndi',
      data: {
        ...updated,
        total: Number(updated.total),
        discount: Number(updated.discount),
        subtotal: Number(updated.subtotal),
        shippingCost: Number(updated.shippingCost),
        tax: Number(updated.tax),
      },
    });
  },
);

// ── POST /api/orders/:id/cancel ────────────────────────────
export const cancelOrder = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const orderId = req.params.id as string;
    const { reason } = req.body as { reason?: string };

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new AppError('Sifariş tapılmadı', 404, 'NOT_FOUND');

    if (req.user?.role !== 'ADMIN' && order.userId !== userId) {
      throw new AppError('Bu sifarişə giriş icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Yalnız gözləyən sifarişlər ləğv edilə bilər', 422, 'CANNOT_CANCEL');
    }

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });

    const updated = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CANCELLED',
          note: reason ?? 'İstifadəçi tərəfindən ləğv edildi',
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason ?? null,
        },
        include: ORDER_INCLUDES,
      });
    }, { maxWait: 10000, timeout: 20000 });

    logger.info(`Order ${order.orderNumber} cancelled by user ${userId}`);

    successResponse(res, {
      message: 'Sifariş ləğv edildi',
      data: {
        ...updated,
        total: Number(updated.total),
        discount: Number(updated.discount),
        subtotal: Number(updated.subtotal),
        shippingCost: Number(updated.shippingCost),
        tax: Number(updated.tax),
      },
    });
  },
);
