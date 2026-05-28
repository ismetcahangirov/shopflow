// src/controllers/paymentController.ts
// Payment Controller — Stripe PaymentIntent, webhook, refund

import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/db';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../config/stripe';
import { logger } from '../config/logger';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { sendEmail, buildOrderConfirmationEmail } from '../utils/sendEmail';
import { config } from '../config/env';

// ── POST /api/payments/create-intent ───────────────────────
export const createPaymentIntent = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const { orderId } = req.body as { orderId: string };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new AppError('Sifariş tapılmadı', 404, 'NOT_FOUND');
    if (order.userId !== userId) throw new AppError('Bu sifarişə giriş icazəniz yoxdur', 403, 'FORBIDDEN');
    if (order.paymentStatus === 'PAID') throw new AppError('Bu sifariş artıq ödənilib', 409, 'ALREADY_PAID');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: 'azn',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentId: paymentIntent.id,
        paymentMethod: 'stripe',
      },
    });

    logger.info(`PaymentIntent ${paymentIntent.id} created for order ${order.orderNumber}`);

    successResponse(res, {
      message: 'Ödəniş intenti yaradıldı',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  },
);

// ── POST /api/payments/webhook ─────────────────────────────
export const stripeWebhook = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      logger.warn('Stripe webhook request without signature');
      res.status(400).json({ error: 'Stripe imzası tələb olunur' });
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.error('Stripe webhook imza xətası', { err });
      res.status(400).json({ error: 'Stripe imzası etibarsızdır' });
      return;
    }

    logger.info(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      default:
        logger.info(`Unhandled Stripe event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  },
);

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId ?? null;
  if (!orderId) {
    logger.error('PaymentIntent metadata-da orderId yoxdur');
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Update order
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: true } },
      },
    });

    // Record status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'CONFIRMED',
        note: 'Ödəniş uğurla tamamlandı',
      },
    });

    // Decrease stock
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
        });
      }
    }

    // Clear user cart
    const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    // Update coupon usage count
    if (order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Send confirmation email
    try {
      const html = buildOrderConfirmationEmail(order.user.name, {
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discount: Number(order.discount),
        total: Number(order.total),
        createdDate: order.createdAt.toISOString().slice(0, 10),
        trackingUrl: `${config.CLIENT_URL}/orders/${order.id}`,
      });

      await sendEmail({
        to: order.user.email,
        subject: `Sifarişiniz təsdiqləndi #${order.orderNumber}`,
        html,
      });
    } catch (emailErr) {
      logger.error('Sifariş təsdiq emaili göndərilərkən xəta', { emailErr });
    }

    logger.info(`Order ${order.orderNumber} payment confirmed`);
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId ?? null;
  if (!orderId) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', paymentStatus: 'UNPAID', cancelledAt: new Date(), cancelReason: 'Ödəniş uğursuz oldu' },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: 'CANCELLED',
        note: 'Ödəniş uğursuz',
      },
    });
  });

  logger.info(`Order ${orderId} cancelled due to payment failure`);
}

async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = charge.payment_intent as string | null;
  if (!paymentIntentId) return;

  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
    include: { items: true },
  });

  if (!order) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'REFUNDED',
        note: 'Geri ödəniş tamamlandı',
      },
    });

    // Restore stock
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  logger.info(`Order ${order.orderNumber} refunded`);
}

// ── POST /api/payments/refund ──────────────────────────────
export const createRefund = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { orderId, reason } = req.body as { orderId: string; reason?: string };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new AppError('Sifariş tapılmadı', 404, 'NOT_FOUND');
    if (!order.stripePaymentId) throw new AppError('Bu sifariş üçün ödəniş tapılmadı', 400, 'NO_PAYMENT');
    if (order.paymentStatus === 'REFUNDED') throw new AppError('Bu sifariş artıq geri qaytarılıb', 409, 'ALREADY_REFUNDED');

    await stripe.refunds.create({
      payment_intent: order.stripePaymentId,
      reason: 'requested_by_customer',
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'REFUNDED',
        status: 'REFUNDED',
        cancelReason: reason ?? null,
        cancelledAt: new Date(),
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'REFUNDED',
        note: reason ?? 'Admin tərəfindən geri ödəniş',
      },
    });

    logger.info(`Refund processed for order ${order.orderNumber}`);

    successResponse(res, {
      message: 'Geri ödəniş uğurla tamamlandı',
    });
  },
);
