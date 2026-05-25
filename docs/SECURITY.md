# SECURITY.md — Təhlükəsizlik Sənədləşməsi

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Təhlükəsizlik Layərləri

```
┌──────────────────────────────────────────────────────┐
│  LAYER 1 — NETWORK                                   │
│  HTTPS (Vercel + Render SSL), Supabase SSL           │
├──────────────────────────────────────────────────────┤
│  LAYER 2 — HTTP HEADERS                              │
│  Helmet: CSP, HSTS, X-Frame-Options, noSniff         │
├──────────────────────────────────────────────────────┤
│  LAYER 3 — CORS                                      │
│  Yalnız shopflow.az + localhost:3000                  │
├──────────────────────────────────────────────────────┤
│  LAYER 4 — RATE LIMITING                             │
│  Brute force, DDoS, spam qoruması                    │
├──────────────────────────────────────────────────────┤
│  LAYER 5 — AUTHENTICATION                            │
│  JWT (15dəq) + httpOnly Refresh Cookie (30 gün)      │
├──────────────────────────────────────────────────────┤
│  LAYER 6 — AUTHORIZATION                             │
│  RBAC: ADMIN | VENDOR | CUSTOMER                     │
├──────────────────────────────────────────────────────┤
│  LAYER 7 — INPUT VALIDATION                          │
│  express-validator + Zod (paylaşılan schema)         │
├──────────────────────────────────────────────────────┤
│  LAYER 8 — DATABASE                                  │
│  Prisma parametrized queries — SQL injection yoxdur  │
├──────────────────────────────────────────────────────┤
│  LAYER 9 — PAYMENT                                   │
│  Stripe webhook imzası yoxlanması                    │
├──────────────────────────────────────────────────────┤
│  LAYER 10 — MEDIA                                    │
│  Cloudinary — fayl tipi + ölçü yoxlaması             │
└──────────────────────────────────────────────────────┘
```

---

## 2. HTTP Security Headers — Helmet (TypeScript)

```typescript
// src/server.ts

import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   [
          "'self'",
          'https://accounts.google.com',
          'https://js.stripe.com',          // Stripe Elements
        ],
        styleSrc:    ["'self'", "'unsafe-inline'"],
        imgSrc:      ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc:  [
          "'self'",
          'https://accounts.google.com',
          'https://api.stripe.com',
          'https://res.cloudinary.com',
        ],
        frameSrc:    [
          'https://accounts.google.com',
          'https://js.stripe.com',          // Stripe iframe
        ],
        objectSrc:   ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    frameguard:     { action: 'deny' },          // Clickjacking qoruması
    noSniff:         true,                        // MIME sniffing qoruması
    hsts: {
      maxAge:            31_536_000,              // 1 il
      includeSubDomains: true,
      preload:           true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hidePoweredBy:  true,                         // X-Powered-By silindi
  })
);
```

### Əlavə olunan Header-lər

| Header | Dəyər | Məqsəd |
|---|---|---|
| `Content-Security-Policy` | Custom | XSS, injection qoruması |
| `X-Frame-Options` | `DENY` | Clickjacking qoruması |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing qoruması |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | HTTPS məcburi |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer məhdudlaşdırma |
| `X-Powered-By` | *(silindi)* | Tech stack gizlətmə |

---

## 3. CORS Konfiqurasiyası (TypeScript)

```typescript
// src/config/corsOptions.ts

import { CorsOptions } from 'cors';

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'https://shopflow.az',
  'https://www.shopflow.az',
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Server-to-server (Stripe webhook, Postman) — origin yoxdur
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS xətası: ${origin} icazəsiz mənbədir`));
    }
  },
  credentials:    true,                             // Cookie göndərmə üçün vacib
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge:         86_400,                           // Preflight nəticəsini 24 saat cache et
};
```

```typescript
// src/server.ts
import cors from 'cors';
import { corsOptions } from './config/corsOptions';

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));               // Preflight sorğuları
```

> ⚠️ **Stripe Webhook İstisnası:**  
> `/api/payments/webhook` endpoint-i CORS-dan kənarda çalışır.  
> Bu endpoint-ə `express.raw()` tətbiq edilir — `express.json()` deyil.

---

## 4. Rate Limiting (TypeScript)

```typescript
// src/middleware/rateLimiter.ts

import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

// ── Auth endpointləri — ciddi limit ──────────────────────
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs:         15 * 60 * 1000,               // 15 dəqiqə
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success:    false,
    message:    'Çox cəhd. 15 dəqiqə sonra yenidən cəhd edin.',
    error:      'RATE_LIMIT_EXCEEDED',
    retryAfter: 900,
  },
  skipSuccessfulRequests: true,                    // Uğurlu girişlər sayılmır
});

// ── Şifrə sıfırlama — daha ciddi ─────────────────────────
export const passwordResetLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,                       // 1 saat
  max:      3,
  message: {
    success: false,
    message: 'Çox cəhd. 1 saat sonra yenidən cəhd edin.',
    error:   'RATE_LIMIT_EXCEEDED',
  },
});

// ── Ödəniş endpointləri ───────────────────────────────────
export const paymentLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,                            // 1 dəqiqə
  max:      20,
  message: {
    success: false,
    message: 'Çox ödəniş sorğusu. Bir az gözləyin.',
    error:   'RATE_LIMIT_EXCEEDED',
  },
});

// ── Fayl yükləmə ─────────────────────────────────────────
export const uploadLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,                       // 1 saat
  max:      10,
  message: {
    success: false,
    message: 'Fayl yükləmə limiti aşıldı.',
    error:   'RATE_LIMIT_EXCEEDED',
  },
});

// ── Ümumi API ─────────────────────────────────────────────
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,                            // 1 dəqiqə
  max:      100,
  message: {
    success: false,
    message: 'Çox sorğu. Bir az gözləyin.',
    error:   'RATE_LIMIT_EXCEEDED',
  },
});
```

### Rate Limit Cədvəli

| Endpoint | Limit | Müddət | Qeyd |
|---|---|---|---|
| `POST /api/auth/login` | 5 | 15 dəq | Uğurlu cəhdlər sayılmır |
| `POST /api/auth/register` | 5 | 15 dəq | — |
| `POST /api/auth/forgot-password` | 3 | 1 saat | — |
| `POST /api/auth/reset-password` | 3 | 1 saat | — |
| `POST /api/auth/google` | 10 | 15 dəq | — |
| `POST /api/payments/*` | 20 | 1 dəq | — |
| `POST /api/users/me/avatar` | 10 | 1 saat | — |
| `POST /api/reviews` | 10 | 1 saat | — |
| Ümumi API | 100 | 1 dəq | — |

---

## 5. Input Validation & Sanitization

### 5.1 Backend — express-validator + Zod

```typescript
// src/middleware/validate.ts

import { Request, Response, NextFunction }    from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (
  req:  Request,
  res:  Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success:    false,
      message:    'Daxil edilən məlumat yanlışdır',
      error:      'VALIDATION_ERROR',
      statusCode: 400,
      details:    errors.array().map((e) => ({
        field:   e.type === 'field' ? e.path : 'unknown',
        message: e.msg,
      })),
    });
    return;
  }
  next();
};
```

```typescript
// src/routes/productRoutes.ts — validasiya nümunəsi

import { body, param, query } from 'express-validator';

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Məhsul adı tələb olunur')
    .isLength({ min: 2, max: 200 }).withMessage('Ad 2-200 simvol olmalıdır')
    .escape(),

  body('price')
    .notEmpty().withMessage('Qiymət tələb olunur')
    .isFloat({ min: 0.01 }).withMessage('Qiymət 0-dan böyük olmalıdır'),

  body('stock')
    .notEmpty().withMessage('Stok tələb olunur')
    .isInt({ min: 0 }).withMessage('Stok mənfi ola bilməz'),

  body('categoryId')
    .notEmpty().withMessage('Kateqoriya tələb olunur')
    .isString().withMessage('Kateqoriya ID string olmalıdır'),

  body('sku')
    .trim()
    .notEmpty().withMessage('SKU tələb olunur')
    .matches(/^[A-Z0-9_-]+$/i).withMessage('SKU yalnız hərf, rəqəm, _ və - ola bilər'),
];

router.post(
  '/',
  protect,
  authorize('ADMIN', 'VENDOR'),
  createProductValidation,
  validate,
  createProduct
);
```

### 5.2 SQL Injection Qoruması — Prisma

Prisma ORM **avtomatik parametrized query** istifadə edir — SQL injection mümkün deyil.

```typescript
// ✅ Təhlükəsiz — Prisma parametrized query
const product = await prisma.product.findUnique({
  where: { slug: req.params.slug },   // Prisma daxilində escape edilir
});

// ✅ Təhlükəsiz — axtarış
const products = await prisma.product.findMany({
  where: {
    name: { contains: req.query.search as string, mode: 'insensitive' },
  },
});

// ❌ OLMAZ — heç vaxt raw query istifadə etmə (zəruri deyilsə)
// await prisma.$queryRawUnsafe(`SELECT * FROM products WHERE name = '${name}'`);

// ✅ Raw query lazım olsa — parametrized
await prisma.$queryRaw`SELECT * FROM products WHERE name = ${name}`;
```

### 5.3 Zod Schema Paylaşımı

```typescript
// shared/schemas/product.schema.ts
// Həm frontend formu həm backend validasiyası üçün eyni schema

import { z } from 'zod';

export const createProductSchema = z.object({
  name:         z.string().min(2).max(200),
  description:  z.string().min(10).max(5000),
  price:        z.number().positive('Qiymət müsbət olmalıdır'),
  comparePrice: z.number().positive().optional(),
  sku:          z.string().regex(/^[A-Z0-9_-]+$/i, 'SKU formatı yanlışdır'),
  stock:        z.number().int().min(0),
  categoryId:   z.string().min(1, 'Kateqoriya seçin'),
  brand:        z.string().optional(),
  tags:         z.array(z.string()).default([]),
  isFeatured:   z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

---

## 6. Stripe Webhook Təhlükəsizliyi

Stripe webhook-ları **imzalanmış** gəlir — saxtalaşdırma mümkün deyil.

```typescript
// src/controllers/paymentController.ts

import Stripe from 'stripe';
import { stripe } from '../config/stripe';

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
    // req.body — RAW buffer olmalıdır (express.raw() middleware)
    event = stripe.webhooks.constructEvent(
      req.body,                              // Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook imza xətası:', err);
    res.status(400).json({ error: 'Webhook imzası yanlışdır' });
    return;
  }

  // Eventləri emal et
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(paymentIntent);
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      await handleRefund(charge);
      break;
    }
    default:
      console.log(`Bilinməyən event: ${event.type}`);
  }

  res.json({ received: true });
};
```

```typescript
// src/server.ts — Webhook route-u JSON middleware-dən ƏVVƏL qeyd et

// ✅ Stripe webhook — RAW body lazımdır
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),    // JSON parse ETMƏ
  stripeWebhook
);

// Qalan bütün route-lar üçün JSON middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

---

## 7. Fayl Yükləmə Təhlükəsizliyi (Cloudinary + Multer)

```typescript
// src/middleware/uploadMiddleware.ts

import multer, { FileFilterCallback } from 'multer';
import { Request }                    from 'express';
import path                           from 'path';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE       = 5 * 1024 * 1024;   // 5MB
const MAX_AVATAR_SIZE      = 2 * 1024 * 1024;   // 2MB

// Memory storage — Cloudinary-ə stream edirik (disk yazmırıq)
const storage = multer.memoryStorage();

const imageFilter = (
  req:  Request,
  file: Express.Multer.File,
  cb:   FileFilterCallback
): void => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(new Error('Yalnız JPG, PNG, WEBP formatları icazəlidir'));
    return;
  }
  cb(null, true);
};

// Məhsul şəkilləri (max 5 şəkil)
export const productImageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files:    5,
  },
});

// Avatar (1 şəkil)
export const avatarUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_AVATAR_SIZE,
    files:    1,
  },
});
```

```typescript
// src/utils/cloudinaryUpload.ts — Buffer-dən Cloudinary-ə yüklə

import { v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id:        publicId,
        resource_type:    'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },    // WebP/AVIF avtomatik
          { width: 1200, crop: 'limit' },               // Max 1200px
        ],
      },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
```

| Qayda | Dəyər |
|---|---|
| İcazəli formatlar | JPG, PNG, WEBP |
| Məhsul şəkli max ölçüsü | 5MB |
| Avatar max ölçüsü | 2MB |
| Max şəkil sayı (məhsul) | 5 |
| Saxlama | Cloudinary CDN (disk yazmırıq) |
| Avtomatik format | WebP/AVIF (Cloudinary tərəfindən) |
| Max genişlik | 1200px (Cloudinary tərəfindən kəsilir) |

---

## 8. Şifrə Hashlanması

```typescript
// models içindəki Prisma pre-save məntiqi controller-də tətbiq edilir

import bcrypt from 'bcryptjs';

// Şifrəni hash et (qeydiyyat / şifrə dəyişmə zamanı)
const hashedPassword = await bcrypt.hash(password, 12);

// Şifrəni yoxla (giriş zamanı)
const isMatch = await bcrypt.compare(enteredPassword, user.password);
```

| Parametr | Dəyər | Qeyd |
|---|---|---|
| Alqoritm | bcryptjs | bcrypt-in JS implementasiyası |
| Salt rounds | 12 | ~250ms hash vaxtı — brute force üçün çətin |
| Max uzunluq | 72 simvol | bcrypt-in fiziki limiti |
| Saxlama | Yalnız hash | Heç vaxt plaintext |
| Cavabda | Silinir | `password` sahəsi heç vaxt client-ə göndərilmir |

---

## 9. Environment Dəyişənlərinin Təhlükəsizliyi

```bash
# .gitignore — Bu fayllar heç vaxt repo-ya getməsin
.env
.env.local
.env.production
.env.development
server/.env
client/.env.local
```

```bash
# Güclü secret yaratma (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Nümunə çıxış:
# a7f3d2e1c4b5a6f7e8d9c0b1a2f3d4e5c6b7a8f9e0d1c2b3a4f5d6e7c8b9a0f1
```

```
Mühit          Saxlama                    Qayda
───────────    ─────────────────────────  ──────────────────────────────
Development    .env faylı (lokal)         Git-ə getmir
Production     Render/Vercel panel        Kod içinə yazılmır
               mühit dəyişənləri         Loglarda görünmür
               (şifrəli saxlanır)
```

**Kritik dəyişənlər:**

```env
# Hər biri minimum 64 simvol — fərqli olmalıdır
JWT_SECRET=<64+ simvol>
JWT_REFRESH_SECRET=<64+ simvol — JWT_SECRET ilə eyni OLMAZ>

# Stripe — test və production açarları qarışdırılmamalıdır
STRIPE_SECRET_KEY=sk_live_...    # Production
STRIPE_SECRET_KEY=sk_test_...    # Development

# Cloudinary API secret — ictimai paylaşılmaz
CLOUDINARY_API_SECRET=<secret>
```

---

## 10. Loglama Qaydaları (Winston)

```typescript
// src/config/logger.ts

import winston from 'winston';

export const logger = winston.createLogger({
  level:  process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
    }),
    // Production-da fayl logları
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log',  level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});
```

```typescript
// ── OLAR ─────────────────────────────────────────────────
logger.info(`Login cəhdi: ${email}`);
logger.warn(`Uğursuz giriş — IP: ${req.ip}, Email: ${email}`);
logger.info(`Sifariş yaradıldı: ${order.orderNumber}, User: ${userId}`);
logger.error('Stripe webhook xətası:', { error: err.message });

// ── OLMAZ — Həssas məlumatlar ─────────────────────────────
logger.info(`Şifrə: ${password}`);                    // ❌ Heç vaxt
logger.info(`Token: ${token}`);                       // ❌ Heç vaxt
logger.info(`Body: ${JSON.stringify(req.body)}`);     // ❌ Şifrə ola bilər
logger.info(`DB URI: ${process.env.DATABASE_URL}`);   // ❌ Credentials görünür
logger.info(`Kart: ${cardNumber}`);                   // ❌ Heç vaxt
```

---

## 11. Dependency Audit

```bash
# Zəiflikləri yoxla
npm audit

# Avtomatik düzəlt (minor/patch)
npm audit fix

# CI/CD-də — high+ zəiflik varsa build uğursuz olsun
npm audit --audit-level=high

# Ayrı-ayrı paketlər üçün
npm audit --omit=dev        # Yalnız production dependencies
```

| Səviyyə | Hərəkət | Vaxt |
|---|---|---|
| `info` | İzlə | — |
| `low` | Növbəti versiyada düzəlt | 1 həftə |
| `moderate` | Prioritetli düzəlt | 3 gün |
| `high` | Dərhal düzəlt | 24 saat |
| `critical` | Deploy blokla, dərhal düzəlt | Dərhal |

---

## 12. Next.js Frontend Təhlükəsizliyi

```typescript
// next.config.ts — Əlavə təhlükəsizlik konfiqurasiyası

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Şəkil domainlərini məhdudlaşdır
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname:  'res.cloudinary.com',
        pathname:  '/shopflow/**',
      },
      {
        protocol: 'https',
        hostname:  'lh3.googleusercontent.com',   // Google avatar
      },
    ],
  },

  // Təhlükəsizlik header-ləri (Vercel-də)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control',    value: 'on' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Admin/Vendor paneli — axtarış motorları indeksləməsin
        source: '/(admin|vendor)/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

```typescript
// middleware.ts — Next.js middleware (root-da)
// Admin/Vendor route-larını server tərəfindən qoru

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route-larını qoru
  if (pathname.startsWith('/admin') || pathname.startsWith('/vendor')) {
    const token = request.cookies.get('refreshToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/vendor/:path*'],
};
```

---

## 13. Production Yoxlama Siyahısı

```
AUTH & TOKEN
  [ ]  JWT_SECRET minimum 64 simvoldur
  [ ]  JWT_REFRESH_SECRET fərqli, minimum 64 simvoldur
  [ ]  Access token müddəti 15 dəqiqədir
  [ ]  Refresh token httpOnly cookie-dədir
  [ ]  Cookie sameSite=strict, secure=true (production)
  [ ]  refreshToken DB-də hash-lənərək saxlanır

HTTP TƏHLÜKƏSİZLİYİ
  [ ]  Helmet aktiv və konfigurasiya edilib
  [ ]  CORS yalnız shopflow.az üçün açıqdır
  [ ]  Rate limiting bütün auth endpointlərindədir
  [ ]  HTTPS məcburi edilib (Render + Vercel SSL)
  [ ]  X-Powered-By header silindi

ÖDƏNİŞ
  [ ]  Stripe webhook imzası yoxlanır
  [ ]  /api/payments/webhook express.raw() ilə işləyir
  [ ]  STRIPE_WEBHOOK_SECRET təyin edilib
  [ ]  Production Stripe açarları istifadə olunur (sk_live_)

FAYL YÜKLƏMƏSİ
  [ ]  Yalnız JPG/PNG/WEBP icazəlidir
  [ ]  Məhsul şəkli max 5MB, avatar max 2MB
  [ ]  Fayl yaddaşda saxlanmır (memory storage + Cloudinary)

VERİLƏNLƏR BAZASI
  [ ]  .env faylı .gitignore-dadır
  [ ]  .env.example-da heç bir real dəyər yoxdur
  [ ]  Supabase SSL bağlantısı aktivdir
  [ ]  Prisma parametrized query istifadə olunur

INPUT VALİDASİYASI
  [ ]  express-validator bütün route-larda işlənir
  [ ]  Zod schema frontend + backend-də paylaşılır
  [ ]  Bütün string sahələri `.trim()` və `.escape()` edilir

AUDIT
  [ ]  npm audit --audit-level=high keçilib
  [ ]  Bütün high/critical zəifliklər düzəldilib
  [ ]  CI/CD-də npm audit işləyir

NEXT.JS
  [ ]  Admin/Vendor route-ları middleware ilə qorunur
  [ ]  next/image yalnız icazəli domainlərdən şəkil yükləyir
  [ ]  robots.txt admin/vendor/cart noindex edir
  [ ]  API route-larında STRIPE_WEBHOOK_SECRET yoxlanır
```
