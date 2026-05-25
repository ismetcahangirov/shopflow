# ERROR_HANDLING.md — Xəta İdarəsi

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Ümumi Strategiya

```
┌──────────────────────────────────────────────────────────┐
│                        BACKEND                           │
│                                                          │
│  Controller → asyncHandler → AppError                    │
│                                  │                       │
│                          Global Error Middleware         │
│                                  │                       │
│                    { success, message, error, status }   │
└──────────────────────────┬───────────────────────────────┘
                           │  HTTP JSON Response
┌──────────────────────────▼───────────────────────────────┐
│                        FRONTEND                          │
│                                                          │
│  Axios Interceptor → TanStack Query → Error State        │
│                                  │                       │
│                          Toast bildirişi                 │
│                          Error Boundary (UI)             │
│                          next/error.tsx                  │
└──────────────────────────────────────────────────────────┘
```

**Əsas prinsip:**
- **Backend** — hər xətanı tutur, standart formata salır, JSON qaytarır
- **Frontend** — hər API xətasını emal edir, istifadəçiyə anlaşılan mesaj göstərir, heç vaxt "undefined" göstərmir

---

## 2. Backend — AppError Sinifi (TypeScript)

```typescript
// src/utils/AppError.ts

export class AppError extends Error {
  public readonly statusCode:    number;
  public readonly errorCode:     string;
  public readonly isOperational: boolean;
  public readonly details?:      unknown;

  constructor(
    message:    string,
    statusCode: number,
    errorCode:  string,
    details?:   unknown
  ) {
    super(message);
    this.statusCode    = statusCode;
    this.errorCode     = errorCode;
    this.isOperational = true;   // Gözlənilən xəta — proqramçı atır
    this.details       = details;

    // Stack trace-i düzgün qur
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ── İstifadə nümunələri ──────────────────────────────────
// throw new AppError('Məhsul tapılmadı',            404, 'NOT_FOUND');
// throw new AppError('Bu email artıq mövcuddur',    409, 'ALREADY_EXISTS');
// throw new AppError('Stokda yoxdur',               422, 'OUT_OF_STOCK');
// throw new AppError('Bu əməliyyat icazəsizdir',    403, 'FORBIDDEN');
```

---

## 3. Backend — Xəta Kodları Sabiti

```typescript
// src/utils/errorCodes.ts

export const ERROR_CODES = {
  // ── Auth ─────────────────────────────────────────────
  UNAUTHORIZED:           { status: 401, message: 'Giriş üçün autentifikasiya tələb olunur' },
  TOKEN_EXPIRED:          { status: 401, message: 'Token müddəti bitib' },
  INVALID_TOKEN:          { status: 401, message: 'Token etibarsızdır' },
  INVALID_CREDENTIALS:    { status: 401, message: 'Email və ya şifrə yanlışdır' },
  FORBIDDEN:              { status: 403, message: 'Bu əməliyyat üçün icazəniz yoxdur' },
  ACCOUNT_DISABLED:       { status: 403, message: 'Hesabınız deaktiv edilib' },
  EMAIL_NOT_VERIFIED:     { status: 403, message: 'Email ünvanınız təsdiqlənməyib' },

  // ── Resurs ───────────────────────────────────────────
  NOT_FOUND:              { status: 404, message: 'Sorğulanan məlumat tapılmadı' },
  ALREADY_EXISTS:         { status: 409, message: 'Bu məlumat artıq mövcuddur' },

  // ── Validasiya ────────────────────────────────────────
  VALIDATION_ERROR:       { status: 400, message: 'Daxil edilən məlumat yanlışdır' },
  INVALID_RESET_TOKEN:    { status: 400, message: 'Sıfırlama tokeni etibarsız və ya müddəti bitib' },

  // ── E-Commerce Xüsusi ────────────────────────────────
  OUT_OF_STOCK:           { status: 422, message: 'Məhsul stokda yoxdur' },
  INSUFFICIENT_STOCK:     { status: 422, message: 'Kifayət qədər stok yoxdur' },
  COUPON_INVALID:         { status: 422, message: 'Kupon kodu etibarsızdır' },
  COUPON_EXPIRED:         { status: 422, message: 'Kupanın müddəti bitib' },
  COUPON_MAX_USES:        { status: 422, message: 'Bu kupon maksimum istifadə limitinə çatıb' },
  COUPON_MIN_ORDER:       { status: 422, message: 'Minimum sifariş məbləği tələbi karşılanmır' },
  ALREADY_REVIEWED:       { status: 422, message: 'Bu məhsula artıq rəy yazıbsınız' },
  ORDER_NOT_CANCELLABLE:  { status: 422, message: 'Bu sifariş ləğv edilə bilməz' },
  PAYMENT_FAILED:         { status: 422, message: 'Ödəniş uğursuz oldu' },
  CATEGORY_HAS_PRODUCTS:  { status: 422, message: 'Məhsul olan kateqoriya silinə bilməz' },
  VENDOR_NOT_APPROVED:    { status: 403, message: 'Vendor hesabınız hələ təsdiqlənməyib' },

  // ── Server ───────────────────────────────────────────
  RATE_LIMIT_EXCEEDED:    { status: 429, message: 'Çox sorğu göndərdiniz. Bir az gözləyin.' },
  INTERNAL_ERROR:         { status: 500, message: 'Server xətası baş verdi' },
  SERVICE_UNAVAILABLE:    { status: 503, message: 'Xidmət müvəqqəti əlçatmazdır' },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
```

---

## 4. Backend — asyncHandler (TypeScript)

```typescript
// src/utils/asyncHandler.ts

import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
  req:  Request,
  res:  Response,
  next: NextFunction
) => Promise<void>;

// try/catch boilerplate-ni aradan qaldırır
// Controller-lər təmiz qalır
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ── Controller nümunəsi ───────────────────────────────────
// Heç bir try/catch lazım deyil — asyncHandler tutur
export const getProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });

    if (!product) {
      throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');
    }

    successResponse(res, { data: product });
  }
);
```

---

## 5. Backend — Global Error Middleware (TypeScript)

```typescript
// src/middleware/errorMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { Prisma }                          from '@prisma/client';
import { AppError }                        from '../utils/AppError';
import { logger }                          from '../config/logger';

export const errorHandler = (
  err:  Error,
  req:  Request,
  res:  Response,
  next: NextFunction
): void => {

  // ── 1. AppError — Gözlənilən operasional xəta ─────────
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${err.errorCode}: ${err.message}`, {
      path:   req.path,
      method: req.method,
    });

    res.status(err.statusCode).json({
      success:    false,
      message:    err.message,
      error:      err.errorCode,
      statusCode: err.statusCode,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  // ── 2. Prisma Xətaları ────────────────────────────────

  // Unikal constraint pozulması (email, slug, sku artıq var)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') ?? 'sahə';
      res.status(409).json({
        success:    false,
        message:    `Bu ${field} artıq mövcuddur`,
        error:      'ALREADY_EXISTS',
        statusCode: 409,
      });
      return;
    }

    // Foreign key constraint (silinəcək record başqa cədvəldə var)
    if (err.code === 'P2003') {
      res.status(422).json({
        success:    false,
        message:    'Bu məlumat başqa yerlərdə istifadə olunduğu üçün silinə bilməz',
        error:      'CONSTRAINT_VIOLATION',
        statusCode: 422,
      });
      return;
    }

    // Record tapılmadı
    if (err.code === 'P2025') {
      res.status(404).json({
        success:    false,
        message:    'Sorğulanan məlumat tapılmadı',
        error:      'NOT_FOUND',
        statusCode: 404,
      });
      return;
    }
  }

  // Prisma validasiya xətası
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success:    false,
      message:    'Verilənlər bazası validasiya xətası',
      error:      'VALIDATION_ERROR',
      statusCode: 400,
    });
    return;
  }

  // ── 3. JWT Xətaları ───────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success:    false,
      message:    'Token etibarsızdır',
      error:      'INVALID_TOKEN',
      statusCode: 401,
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success:    false,
      message:    'Token müddəti bitib',
      error:      'TOKEN_EXPIRED',
      statusCode: 401,
    });
    return;
  }

  // ── 4. Multer Xətaları ────────────────────────────────
  if (err.name === 'MulterError') {
    const multerErr = err as { code: string };
    const message =
      multerErr.code === 'LIMIT_FILE_SIZE'
        ? 'Fayl ölçüsü limitdən böyükdür'
        : multerErr.code === 'LIMIT_FILE_COUNT'
        ? 'Fayl sayı limitdən çoxdur'
        : 'Fayl yükləmə xətası';

    res.status(400).json({
      success:    false,
      message,
      error:      'UPLOAD_ERROR',
      statusCode: 400,
    });
    return;
  }

  // ── 5. CORS Xətası ────────────────────────────────────
  if (err.message?.includes('CORS')) {
    res.status(403).json({
      success:    false,
      message:    'CORS siyasəti ilə bloklandı',
      error:      'CORS_ERROR',
      statusCode: 403,
    });
    return;
  }

  // ── 6. Gözlənilməyən Xətalar ─────────────────────────
  logger.error(`[UnhandledError] ${err.message}`, {
    stack:  err.stack,
    path:   req.path,
    method: req.method,
    body:   req.body,
  });

  // Production-da detalları gizlət
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Server xətası baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.'
      : err.message;

  res.status(500).json({
    success:    false,
    message,
    error:      'INTERNAL_ERROR',
    statusCode: 500,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
```

```typescript
// src/server.ts — ən sona qeyd et

import { errorHandler } from './middleware/errorMiddleware';

// Bütün route-lardan SONRA
app.use(errorHandler);

// 404 — tapılmayan route-lar
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success:    false,
    message:    `${req.originalUrl} — Bu endpoint mövcud deyil`,
    error:      'NOT_FOUND',
    statusCode: 404,
  });
});
```

---

## 6. Backend — API Response Utility

```typescript
// src/utils/apiResponse.ts

import { Response } from 'express';

interface SuccessResponseOptions {
  res:        Response;
  message?:   string;
  data?:      unknown;
  statusCode?: number;
  pagination?: {
    page:  number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const successResponse = (
  res:  Response,
  opts: Omit<SuccessResponseOptions, 'res'>
): void => {
  const {
    message    = 'Əməliyyat uğurla tamamlandı',
    data,
    statusCode = 200,
    pagination,
  } = opts;

  res.status(statusCode).json({
    success: true,
    message,
    ...(data      !== undefined && { data }),
    ...(pagination !== undefined && { pagination }),
  });
};
```

---

## 7. Frontend — API Xəta Parser

```typescript
// src/utils/parseApiError.ts

import { AxiosError } from 'axios';

interface ApiErrorResponse {
  success:    false;
  message:    string;
  error:      string;
  statusCode: number;
  details?:   Array<{ field: string; message: string }>;
}

export const parseApiError = (error: unknown): string => {
  // Axios xətası
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.message) return data.message;

    // HTTP status-a görə fallback mesaj
    switch (error.response?.status) {
      case 400: return 'Daxil edilən məlumat yanlışdır';
      case 401: return 'Giriş üçün autentifikasiya tələb olunur';
      case 403: return 'Bu əməliyyat üçün icazəniz yoxdur';
      case 404: return 'Sorğulanan məlumat tapılmadı';
      case 409: return 'Bu məlumat artıq mövcuddur';
      case 422: return 'Əməliyyat tamamlana bilmədi';
      case 429: return 'Çox sorğu göndərdiniz. Bir az gözləyin.';
      case 500: return 'Server xətası. Bir az sonra yenidən cəhd edin.';
      case 503: return 'Xidmət müvəqqəti əlçatmazdır';
    }

    if (!error.response) return 'İnternet bağlantınızı yoxlayın';
  }

  // String xəta
  if (typeof error === 'string') return error;

  // Error obyekti
  if (error instanceof Error) return error.message;

  return 'Naməlum xəta baş verdi';
};

// Validasiya xətası detallarını çıxar
export const getFieldErrors = (
  error: unknown
): Record<string, string> => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.details) {
      return Object.fromEntries(
        data.details.map(({ field, message }) => [field, message])
      );
    }
  }
  return {};
};
```

---

## 8. Frontend — TanStack Query Xəta İdarəsi

```typescript
// src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';
import { parseApiError } from '@/utils/parseApiError';
import toast             from 'react-hot-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 401/403/404 xətalarında yenidən cəhd etmə
        if (error instanceof Error) {
          const status = (error as any)?.response?.status;
          if ([401, 403, 404].includes(status)) return false;
        }
        return failureCount < 2;   // Digər xətalarda max 2 dəfə
      },
      staleTime:           5 * 60 * 1000,   // 5 dəqiqə
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        // Qlobal mutation xəta toast-u
        const message = parseApiError(error);
        toast.error(message);
      },
    },
  },
});
```

```typescript
// Komponentdə istifadə — products hook
// src/hooks/useProducts.ts

import { useQuery }      from '@tanstack/react-query';
import api               from '@/lib/api';
import { parseApiError } from '@/utils/parseApiError';
import type { Product }  from '@/types/product.types';

export const useProducts = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn:  async () => {
      const { data } = await api.get('/products', { params });
      return data.data as Product[];
    },
    // Spesifik xəta halları
    throwOnError: (error) => {
      const status = (error as any)?.response?.status;
      return status === 500;   // Yalnız server xətası üçün error boundary-ə at
    },
  });
};

// Komponentdə
const ProductsPage = () => {
  const { data, isLoading, isError, error } = useProducts();

  if (isLoading) return <ProductGridSkeleton />;

  if (isError) return (
    <ErrorState message={parseApiError(error)} />
  );

  return <ProductGrid products={data ?? []} />;
};
```

---

## 9. Frontend — Toast Bildiriş Sistemi

```typescript
// src/utils/toast.ts
// react-hot-toast wrapper — bütün layihədə standart istifadə

import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    }),

  error: (message: string) =>
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    }),

  loading: (message: string) =>
    toast.loading(message, {
      position: 'top-right',
    }),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error?: string }
  ) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error:   (err) => messages.error ?? parseApiError(err),
    }),
};

// ── İstifadə nümunələri ───────────────────────────────────
// showToast.success('Məhsul səbətə əlavə edildi');
// showToast.error('Stokda yoxdur');
//
// showToast.promise(createOrder(), {
//   loading: 'Sifariş yaradılır...',
//   success: 'Sifariş uğurla yaradıldı!',
//   error:   'Sifariş zamanı xəta baş verdi',
// });
```

---

## 10. Frontend — Error Boundary (React)

```typescript
// src/components/common/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info);
    // Production-da Sentry-yə göndər
    // Sentry.captureException(error, { extra: info });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-lg font-medium text-gray-700">
            Bir şeylər səhv getdi
          </p>
          <p className="text-sm text-gray-500">
            {this.state.error?.message ?? 'Naməlum xəta'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm"
          >
            Yenidən cəhd et
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 11. Next.js — Error Səhifələri

```typescript
// src/app/[locale]/error.tsx — Route səviyyəsində xəta
'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[PageError]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Xəta baş verdi
      </h2>
      <p className="text-gray-500 text-center max-w-md">
        {error.message || 'Gözlənilməz bir xəta baş verdi. Səhifəni yenidən yükləyin.'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-accent text-white rounded-lg font-medium"
      >
        Yenidən cəhd et
      </button>
    </div>
  );
}
```

```typescript
// src/app/[locale]/(shop)/products/[slug]/not-found.tsx
import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600">Məhsul tapılmadı</p>
      <p className="text-gray-500 text-center max-w-md">
        Axtardığınız məhsul mövcud deyil və ya silinib.
      </p>
      <Link
        href="/products"
        className="px-6 py-2 bg-accent text-white rounded-lg font-medium"
      >
        Məhsullara qayıt
      </Link>
    </div>
  );
}
```

```typescript
// src/app/[locale]/not-found.tsx — Global 404
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600">Səhifə tapılmadı</p>
      <Link href="/" className="px-6 py-2 bg-accent text-white rounded-lg">
        Ana Səhifəyə Qayıt
      </Link>
    </div>
  );
}
```

---

## 12. Xüsusi Xəta Halları

### Stok Yoxlama (Sifariş zamanı)

```typescript
// src/controllers/orderController.ts

export const createOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await prisma.cart.findUnique({
      where:   { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart?.items.length) {
      throw new AppError('Səbətiniz boşdur', 422, 'CART_EMPTY');
    }

    // Stok yoxlaması — transaction içində
    await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (!item.product.isActive) {
          throw new AppError(
            `"${item.product.name}" artıq satışda deyil`,
            422,
            'PRODUCT_UNAVAILABLE'
          );
        }
        if (item.product.stock < item.quantity) {
          throw new AppError(
            `"${item.product.name}" məhsulundan yalnız ${item.product.stock} ədəd qalıb`,
            422,
            'INSUFFICIENT_STOCK',
            { productId: item.product.id, available: item.product.stock }
          );
        }
      }
      // Sifariş yarat...
    });
  }
);
```

### Kupon Validasiyası

```typescript
// src/controllers/couponController.ts

export const validateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, orderTotal } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Kupon kodu etibarsızdır', 422, 'COUPON_INVALID');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new AppError('Kupanın müddəti bitib', 422, 'COUPON_EXPIRED');
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError(
        'Bu kupon maksimum istifadə limitinə çatıb',
        422,
        'COUPON_MAX_USES'
      );
    }

    if (coupon.minOrderValue && orderTotal < Number(coupon.minOrderValue)) {
      throw new AppError(
        `Bu kupon üçün minimum sifariş məbləği ₼${coupon.minOrderValue}-dir`,
        422,
        'COUPON_MIN_ORDER',
        { minRequired: coupon.minOrderValue, current: orderTotal }
      );
    }

    // Endirim hesabla
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (orderTotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.value);
    }

    successResponse(res, {
      data: {
        code:       coupon.code,
        type:       coupon.type,
        value:      coupon.value,
        discount:   Math.round(discount * 100) / 100,
        finalTotal: Math.max(0, orderTotal - discount),
      },
    });
  }
);
```

### Vendor İcazə Yoxlaması

```typescript
// src/controllers/productController.ts

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');
    }

    // Vendor yalnız öz məhsulunu dəyişə bilər
    if (
      req.user!.role === 'VENDOR' &&
      product.vendorId !== req.user!.id
    ) {
      throw new AppError(
        'Yalnız öz məhsullarınızı dəyişə bilərsiniz',
        403,
        'FORBIDDEN'
      );
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data:  req.body,
    });

    successResponse(res, {
      message: 'Məhsul uğurla yeniləndi',
      data:    updated,
    });
  }
);
```

---

## 13. Xəta İdarəsi Qaydaları

```
BACKEND
  ✅  Hər controller asyncHandler ilə sarılır
  ✅  İş məntiqi xətaları throw new AppError() ilə atılır
  ✅  try/catch yalnız xüsusi hallarda (Stripe, Cloudinary)
  ✅  Prisma xətaları global middleware-də tutulur
  ✅  Production-da stack trace göndərilmir
  ✅  Bütün xətalar Winston ilə loglanır
  ✅  Həssas məlumatlar (şifrə, token) loglarda olmur

FRONTEND
  ✅  parseApiError() bütün xətalarda istifadə olunur
  ✅  TanStack Query defaultOptions-da qlobal mutation error handler
  ✅  Toast bildirişləri showToast utility ilə
  ✅  Siyahı səhifələrindəki xətalar ErrorState komponenti ilə
  ✅  Kritik xətalar ErrorBoundary ilə tutulur
  ✅  Next.js error.tsx hər route qrupunda mövcuddur
  ✅  404 halları not-found.tsx ilə idarə olunur
  ✅  İstifadəçiyə heç vaxt "undefined" göstərilmir
  ✅  Loading skeleton isLoading zamanı göstərilir

ÜMUMI
  ❌  console.log xəta məlumatları (logger istifadə et)
  ❌  Frontend-də API xətalarını susqun keç
  ❌  Production-da stack trace göndər
  ❌  Həssas məlumatları (şifrə, kart) xəta mesajlarında göstər
```
