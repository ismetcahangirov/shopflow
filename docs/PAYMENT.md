# PAYMENT.md — Stripe Ödəniş İnteqrasiyası

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Ümumi Baxış

| Parametr | Dəyər |
|---|---|
| Ödəniş sistemi | Stripe |
| İnteqrasiya üsulu | Stripe Elements (frontend) + Stripe SDK (backend) |
| Dəstəklənən ödəniş | Kredit/debet kartı, Apple Pay, Google Pay |
| Valyuta | AZN (azn) |
| Webhook | `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` |
| Test kartları | Stripe test mode |

---

## 2. Quraşdırma

```bash
# Backend
cd server
npm install stripe

# Frontend
cd client
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 3. Ödəniş Axını (Tam)

```
Customer "Sifarişi Tamamla" düyməsinə basır
         │
         ▼
POST /api/payments/create-intent
  • Sifariş tapılır (orderId)
  • Stok yoxlanır
  • Stripe PaymentIntent yaradılır
  • clientSecret → frontend-ə qaytarılır
         │
         ▼
Frontend Stripe Elements açılır
  • Kart məlumatları daxil edilir
  • stripe.confirmPayment() çağırılır
         │
         ├── Uğurlu → /order/success/[id]
         │
         └── Stripe → Backend Webhook
               POST /api/payments/webhook
               payment_intent.succeeded
                    │
                    ▼
               Prisma transaction:
               • Order.paymentStatus = 'PAID'
               • Order.status = 'CONFIRMED'
               • Stok azaldılır
               • Səbət təmizlənir
               • Resend ilə email göndərilir
```

---

## 4. Backend Konfiqurasiyası

### 4.1 Stripe SDK Init

```typescript
// src/config/stripe.ts

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY mühit dəyişəni tələb olunur');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript:  true,
});
```

### 4.2 Ödəniş Controller

```typescript
// src/controllers/paymentController.ts

import { Request, Response }  from 'express';
import Stripe                  from 'stripe';
import { stripe }              from '../config/stripe';
import { prisma }              from '../config/db';
import { asyncHandler }        from '../utils/asyncHandler';
import { AppError }            from '../utils/AppError';
import { successResponse }     from '../utils/apiResponse';
import { sendEmail }           from '../utils/sendEmail';
import { logger }              from '../config/logger';

// ── PaymentIntent Yarat ──────────────────────────────────
export const createPaymentIntent = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: {
        items:   { include: { product: { select: { stock: true, name: true } } } },
        user:    { select: { id: true, email: true } },
      },
    });

    if (!order) {
      throw new AppError('Sifariş tapılmadı', 404, 'NOT_FOUND');
    }

    // Yalnız sifariş sahibi ödəniş edə bilər
    if (order.userId !== req.user!.id) {
      throw new AppError('Bu sifariş sizə aid deyil', 403, 'FORBIDDEN');
    }

    if (order.paymentStatus === 'PAID') {
      throw new AppError('Bu sifariş artıq ödənilib', 422, 'ALREADY_PAID');
    }

    // Stok yenidən yoxla
    for (const item of order.items) {
      if (item.product && item.product.stock < item.quantity) {
        throw new AppError(
          `"${item.productName}" məhsulundan kifayət qədər stok yoxdur`,
          422,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    // Məbləği qəpiyə çevir (Stripe cents/qəpik istifadə edir)
    const amountInQepik = Math.round(Number(order.total) * 100);

    // PaymentIntent yarat
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInQepik,
      currency: 'azn',
      metadata: {
        orderId:     order.id,
        orderNumber: order.orderNumber,
        userId:      order.userId,
        userEmail:   order.user.email,
      },
      receipt_email:          order.user.email,
      automatic_payment_methods: { enabled: true },
    });

    // Order-ə Stripe ID-ni saxla
    await prisma.order.update({
      where: { id: orderId },
      data:  { stripePaymentId: paymentIntent.id },
    });

    successResponse(res, {
      data: {
        clientSecret: paymentIntent.client_secret,
        amount:       amountInQepik,
        currency:     'azn',
        orderId,
      },
    });
  }
);

// ── Stripe Webhook ────────────────────────────────────────
export const stripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    res.status(400).json({ error: 'Stripe imzası yoxdur' });
    return;
  }

  let event: Stripe.Event;

  try {
    // req.body RAW buffer olmalıdır!
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error('Stripe webhook imza xətası:', err);
    res.status(400).json({ error: 'Webhook imzası yanlışdır' });
    return;
  }

  logger.info(`Stripe event alındı: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        logger.info(`İşlənməyən Stripe event: ${event.type}`);
    }
  } catch (err) {
    logger.error(`Stripe event emal xətası [${event.type}]:`, err);
    // 200 qaytarırıq — Stripe yenidən cəhd etməsin
    // Xəta artıq loglanıb
  }

  res.json({ received: true });
};

// ── Ödəniş Uğurlu ────────────────────────────────────────
async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const { orderId, orderNumber } = paymentIntent.metadata;

  if (!orderId) {
    logger.warn(`PaymentIntent metadata-da orderId yoxdur: ${paymentIntent.id}`);
    return;
  }

  const order = await prisma.order.findUnique({
    where:   { id: orderId },
    include: {
      items: { include: { product: true } },
      user:  { select: { email: true, name: true } },
    },
  });

  if (!order) {
    logger.warn(`Sifariş tapılmadı: ${orderId}`);
    return;
  }

  if (order.paymentStatus === 'PAID') {
    logger.info(`Sifariş artıq ödənilib: ${orderId}`);
    return;
  }

  // Prisma transaction — atomic əməliyyat
  await prisma.$transaction(async (tx) => {
    // 1. Sifarişi yenilə
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus:   'PAID',
        status:          'CONFIRMED',
        paymentMethod:   'stripe',
        stripePaymentId: paymentIntent.id,
      },
    });

    // 2. Status tarixçəsi əlavə et
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: 'CONFIRMED',
        note:   'Stripe ilə ödəniş uğurla tamamlandı',
      },
    });

    // 3. Stoku azalt
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock:      { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
      }
    }

    // 4. Customer-in səbətini təmizlə
    await tx.cart.update({
      where: { userId: order.userId },
      data:  { items: { deleteMany: {} } },
    }).catch(() => {
      // Səbət artıq boş ola bilər — önəmli deyil
    });
  });

  // 5. Email bildirişi göndər (transaction-dan kənar)
  try {
    await sendEmail({
      to:      order.user.email,
      subject: `Sifarişiniz təsdiqləndi — №${orderNumber}`,
      html:    buildOrderConfirmationEmail(order),
    });
  } catch (emailErr) {
    // Email xətası sifarişi ləğv etmir — yalnız logla
    logger.error(`Sifariş təsdiq emaili göndərilmədi: ${orderId}`, emailErr);
  }

  logger.info(`Ödəniş uğurlu: Sifariş ${orderNumber} təsdiqləndi`);
}

// ── Ödəniş Uğursuz ────────────────────────────────────────
async function handlePaymentFailure(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const { orderId } = paymentIntent.metadata;
  if (!orderId) return;

  await prisma.order.update({
    where: { id: orderId },
    data:  { paymentStatus: 'UNPAID', status: 'PENDING' },
  });

  logger.warn(`Ödəniş uğursuz: Sifariş ${orderId}`);
}

// ── Geri Ödəniş ───────────────────────────────────────────
async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) return;

  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (!order) return;

  const isFullRefund = charge.amount_refunded >= charge.amount;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      status:        isFullRefund ? 'REFUNDED'  : order.status,
    },
  });

  logger.info(`Geri ödəniş: Sifariş ${order.orderNumber} — ${isFullRefund ? 'tam' : 'qismən'}`);
}

// ── Admin: Geri Ödəniş Yarat ──────────────────────────────
export const createRefund = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId, amount, reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Sifariş tapılmadı', 404, 'NOT_FOUND');
    }

    if (order.paymentStatus !== 'PAID') {
      throw new AppError('Bu sifariş üçün geri ödəniş mümkün deyil', 422, 'REFUND_NOT_POSSIBLE');
    }

    if (!order.stripePaymentId) {
      throw new AppError('Stripe ödəniş ID tapılmadı', 422, 'NO_PAYMENT_ID');
    }

    // Stripe refund yarat
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentId,
      amount:         amount ? Math.round(amount * 100) : undefined, // undefined = tam geri ödəniş
      reason:         (reason as Stripe.RefundCreateParams.Reason) ?? 'requested_by_customer',
    });

    successResponse(res, {
      message: 'Geri ödəniş uğurla yaradıldı',
      data: {
        refundId: refund.id,
        amount:   refund.amount / 100,
        status:   refund.status,
      },
    });
  }
);
```

### 4.3 Route Qurulumu

```typescript
// src/routes/paymentRoutes.ts

import { Router }        from 'express';
import express           from 'express';
import { protect }       from '../middleware/authMiddleware';
import { authorize }     from '../middleware/roleMiddleware';
import { paymentLimiter }from '../middleware/rateLimiter';
import {
  createPaymentIntent,
  stripeWebhook,
  createRefund,
}                        from '../controllers/paymentController';

const router = Router();

// ── Stripe Webhook — JSON parse OLMADAN (raw body lazımdır) ─
// Bu route app.use(express.json()) -dan ƏVVƏL server.ts-də qeyd edilməlidir
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// ── Customer: PaymentIntent yarat ──────────────────────────
router.post(
  '/create-intent',
  protect,
  authorize('CUSTOMER'),
  paymentLimiter,
  createPaymentIntent
);

// ── Admin: Geri ödəniş yarat ───────────────────────────────
router.post(
  '/refund',
  protect,
  authorize('ADMIN'),
  createRefund
);

export default router;
```

```typescript
// src/server.ts — Kritik sıra!

import express           from 'express';
import paymentRoutes     from './routes/paymentRoutes';

const app = express();

// ⚠️ Stripe webhook-u JSON middleware-dən ƏVVƏL qeyd et
app.use('/api/payments', paymentRoutes);

// Qalan bütün route-lar üçün JSON middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 5. Frontend İnteqrasiyası

### 5.1 Stripe Init

```typescript
// src/lib/stripe.ts
'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};
```

### 5.2 Checkout Səhifəsi — PaymentIntent Al

```typescript
// src/app/[locale]/(shop)/checkout/page.tsx
'use client';

import { useState, useEffect }          from 'react';
import { Elements }                      from '@stripe/react-stripe-js';
import { getStripe }                     from '@/lib/stripe';
import { StripePayment }                 from '@/components/shop/StripePayment';
import api                               from '@/lib/api';
import { parseApiError }                 from '@/utils/parseApiError';

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId,      setOrderId]      = useState<string | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const handleCreateOrder = async (addressId: string, couponCode?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sifariş yarat
      const orderRes = await api.post('/orders', { addressId, couponCode });
      const newOrderId = orderRes.data.data.id;
      setOrderId(newOrderId);

      // 2. PaymentIntent al
      const paymentRes = await api.post('/payments/create-intent', {
        orderId: newOrderId,
      });
      setClientSecret(paymentRes.data.data.clientSecret);

    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (clientSecret && orderId) {
    return (
      <Elements
        stripe={getStripe()}
        options={{
          clientSecret,
          appearance: {
            theme:     'stripe',
            variables: {
              colorPrimary:    '#F97316',   // accent narıncı
              colorBackground: '#ffffff',
              fontFamily:      'Inter, system-ui, sans-serif',
              borderRadius:    '8px',
            },
          },
          locale: 'az',
        }}
      >
        <StripePayment
          clientSecret={clientSecret}
          orderId={orderId}
        />
      </Elements>
    );
  }

  return (
    <CheckoutForm
      onSubmit={handleCreateOrder}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

### 5.3 StripePayment Komponenti

```typescript
// src/components/shop/StripePayment.tsx
'use client';

import { useState }                          from 'react';
import { PaymentElement, useStripe,
         useElements }                        from '@stripe/react-stripe-js';
import { useRouter }                          from 'next/navigation';
import { useLocale, useTranslations }         from 'next-intl';
import Button                                 from '@/components/common/Button';
import { parseApiError }                      from '@/utils/parseApiError';
import { Lock }                               from 'lucide-react';

interface StripePaymentProps {
  clientSecret: string;
  orderId:      string;
}

export function StripePayment({ clientSecret, orderId }: StripePaymentProps) {
  const stripe      = useStripe();
  const elements    = useElements();
  const router      = useRouter();
  const locale      = useLocale();
  const t           = useTranslations('checkout');

  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/order/success/${orderId}`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      // Stripe-in öz xəta mesajı göstərilir (artıq lokalizasiya edilib)
      setError(stripeError.message ?? t('payment_failed'));
      setIsLoading(false);
    } else {
      // Yönləndirmə olmadısa — uğurlu
      router.push(`/${locale}/order/success/${orderId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('payment')}
        </h2>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={!stripe || !elements}
        icon={<Lock size={16} />}
        size="lg"
      >
        {isLoading ? t('processing') : t('place_order')}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock size={12} />
        <span>Ödənişiniz Stripe tərəfindən şifrələnib</span>
      </div>
    </form>
  );
}
```

### 5.4 Sifariş Uğur Səhifəsi

```typescript
// src/app/[locale]/(shop)/order/success/[id]/page.tsx

import { notFound }        from 'next/navigation';
import { CheckCircle2 }    from 'lucide-react';
import Link                from 'next/link';

async function getOrder(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return null;
  const { data } = await res.json();
  return data;
}

export default async function OrderSuccessPage({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle2 size={80} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900">
        Sifarişiniz qəbul edildi! 🎉
      </h1>
      <p className="text-gray-500">
        Sifariş №<strong>{order.orderNumber}</strong> uğurla yaradıldı.
        Email bildirişi göndərildi.
      </p>
      <div className="bg-gray-50 rounded-xl p-6 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sifariş nömrəsi:</span>
          <span className="font-medium">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ümumi məbləğ:</span>
          <span className="font-bold text-accent">₼{Number(order.total).toFixed(2)}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Link
          href={`/${locale}/orders/${id}`}
          className="flex-1 bg-accent text-white py-3 rounded-xl font-medium text-center"
        >
          Sifarişi İzlə
        </Link>
        <Link
          href={`/${locale}/products`}
          className="flex-1 border border-gray-300 py-3 rounded-xl font-medium text-center"
        >
          Alış-verişə Davam Et
        </Link>
      </div>
    </div>
  );
}
```

---

## 6. Sifariş Nömrəsi Generasiyası

```typescript
// src/utils/generateOrderNumber.ts

export const generateOrderNumber = (): string => {
  const year   = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900_000) + 100_000; // 6 rəqəm
  return `ORD-${year}${random}`;                                 // ORD-2026123456
};

// Sifariş yaradılanda:
// const order = await prisma.order.create({
//   data: { orderNumber: generateOrderNumber(), ... }
// })
```

---

## 7. Email Şablonu (Sifariş Təsdiqi)

```typescript
// src/utils/sendEmail.ts — buildOrderConfirmationEmail

interface OrderForEmail {
  orderNumber: string;
  total:       any;
  items:       Array<{
    productName: string;
    quantity:    number;
    price:       any;
  }>;
  user: { name: string; email: string };
}

export function buildOrderConfirmationEmail(order: OrderForEmail): string {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">
          ${item.productName}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: right;">
          ₼${Number(item.price).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="az">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sifariş Təsdiqi</title>
    </head>
    <body style="font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white;
                  border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

        <!-- Header -->
        <div style="background: #0F172A; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ShopFlow</h1>
          <p style="color: #94a3b8; margin: 8px 0 0;">Sifariş Təsdiqi</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <h2 style="color: #0F172A; margin: 0 0 8px;">
            Sifarişiniz alındı! 🎉
          </h2>
          <p style="color: #64748b;">Salam, ${order.user.name}!</p>
          <p style="color: #64748b;">
            <strong style="color: #0F172A;">${order.orderNumber}</strong>
            nömrəli sifarişiniz uğurla qəbul edildi.
          </p>

          <!-- Məhsullar -->
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px 8px; text-align: left; font-size: 14px; color: #64748b;">
                  Məhsul
                </th>
                <th style="padding: 12px 8px; text-align: center; font-size: 14px; color: #64748b;">
                  Miqdar
                </th>
                <th style="padding: 12px 8px; text-align: right; font-size: 14px; color: #64748b;">
                  Qiymət
                </th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 8px; font-weight: bold; font-size: 16px;">
                  Ümumi:
                </td>
                <td style="padding: 16px 8px; text-align: right; font-weight: bold;
                            font-size: 18px; color: #F97316;">
                  ₼${Number(order.total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a
              href="https://shopflow.az/az/orders"
              style="background: #F97316; color: white; padding: 14px 32px;
                     border-radius: 8px; text-decoration: none; font-weight: bold;
                     display: inline-block;"
            >
              Sifarişimi İzlə
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © 2026 ShopFlow. Bütün hüquqlar qorunur.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0;">
            Suallarınız üçün: <a href="mailto:info@shopflow.az" style="color: #F97316;">
              info@shopflow.az
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
```

---

## 8. Stripe Test Kartları

```
✅ Uğurlu ödəniş:
   Nömrə:      4242 4242 4242 4242
   Tarix:      Hər hansı gələcək tarix
   CVC:        Hər hansı 3 rəqəm
   Ünvan ZIP:  Hər hansı 5 rəqəm

❌ Rədd edilmiş kart:
   Nömrə:      4000 0000 0000 0002

🔐 3D Secure tələb edir:
   Nömrə:      4000 0025 0000 3155

💳 Qeyri-kafi balans:
   Nömrə:      4000 0000 0000 9995

🌍 AZN ödənişi (test):
   Nömrə:      4242 4242 4242 4242
   (AZN valyutası test mode-da tam dəstəklənir)
```

---

## 9. Webhook Lokal Test

```bash
# Stripe CLI quraşdır
brew install stripe/stripe-cli/stripe

# Giriş et
stripe login

# Lokal webhook-u dinlə (development-da)
stripe listen --forward-to localhost:5000/api/payments/webhook

# Test event göndər
stripe trigger payment_intent.succeeded

# Xüsusi məbləğ ilə test
stripe trigger payment_intent.succeeded \
  --override payment_intent:amount=250000 \
  --override payment_intent:currency=azn
```

---

## 10. Ödəniş Qaydaları

```
BACKEND
  ✅  Webhook RAW body ilə işləyir (express.raw())
  ✅  Webhook imzası mütləq yoxlanır
  ✅  Webhook route-u express.json()-dan əvvəl qeydiyyatdandır
  ✅  İdempotency — iki dəfə PAID olmasın (yoxlama var)
  ✅  Stok yoxlaması transaction içindədir
  ✅  Email xətası sifarişi ləğv etmir
  ✅  Webhook 200 qaytarır (Stripe yenidən göndərməsin)
  ✅  Məbləğ qəpiyə çevrilir (cents/qəpik)
  ❌  Client-side ödəniş doğrulaması (yalnız webhook)
  ❌  Stripe secret key frontend-ə göndərilir

FRONTEND
  ✅  loadStripe() həmişə public key ilə
  ✅  PaymentElement — Stripe-in hazır UI-i
  ✅  return_url orderId daxildir
  ✅  Stripe xəta mesajları birbaşa göstərilir
  ✅  Yükləniş vəziyyəti düzgün idarə edilir
  ❌  Kart məlumatları heç vaxt frontend-də saxlanmır
  ❌  clientSecret loglara yazılmır
```
