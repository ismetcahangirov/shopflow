# ROLES_PERMISSIONS.md — Rol və İcazələr

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Rol Sisteminə Baxış

```
┌──────────────────────────────────────────────────────────┐
│                         ADMIN                            │
│  Tam idarəetmə: istifadəçilər, məhsullar, sifarişlər,   │
│  vendorlar, kuponlar, kateqoriyalar, rəylər, analitika   │
├──────────────────────────────────────────────────────────┤
│                        VENDOR                            │
│  Öz mağazasını, məhsullarını, sifarişlərini idarə edir  │
│  Admin tərəfindən təsdiqlənməli — əvvəlcə PENDING        │
├──────────────────────────────────────────────────────────┤
│                       CUSTOMER                           │
│  Məhsulları axtar, səbətə əlavə et, sifariş ver,        │
│  ödəniş et, rəy yaz, istək siyahısı idarə et            │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Tam İcazə Matrisi

### 2.1 İstifadəçi İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Bütün istifadəçiləri gör | ✅ | ❌ | ❌ |
| İstifadəçi detalını gör | ✅ | ❌ | ❌ |
| İstifadəçini aktiv/deaktiv et | ✅ | ❌ | ❌ |
| İstifadəçi rolunu dəyiş | ✅ | ❌ | ❌ |
| Öz profilini gör | ✅ | ✅ | ✅ |
| Öz profilini yenilə | ✅ | ✅ | ✅ |
| Öz şifrəsini dəyiş | ✅ | ✅ | ✅ |
| Avatar yüklə | ✅ | ✅ | ✅ |

---

### 2.2 Məhsul İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Bütün məhsulları gör (public) | ✅ | ✅ | ✅ |
| Məhsul detalını gör (public) | ✅ | ✅ | ✅ |
| Məhsul yarat | ✅ | ✅ | ❌ |
| Öz məhsulunu yenilə | ✅ | ✅ (yalnız öz) | ❌ |
| İstənilən məhsulu yenilə | ✅ | ❌ | ❌ |
| Öz məhsulunu sil | ✅ | ✅ (yalnız öz) | ❌ |
| `isFeatured` dəyişdir | ✅ | ❌ | ❌ |
| `isActive` dəyişdir | ✅ | ❌ | ❌ |
| Şəkil yüklə | ✅ | ✅ (öz məhsulu) | ❌ |

---

### 2.3 Kateqoriya İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Bütün kateqoriyaları gör | ✅ | ✅ | ✅ |
| Kateqoriya yarat | ✅ | ❌ | ❌ |
| Kateqoriyanı yenilə | ✅ | ❌ | ❌ |
| Kateqoriyanı sil | ✅ | ❌ | ❌ |

---

### 2.4 Sifariş İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Bütün sifarişləri gör | ✅ | ❌ | ❌ |
| Öz mağazasının sifarişlərini gör | ❌ | ✅ | ❌ |
| Öz sifarişlərini gör | ✅ | ✅ | ✅ |
| Sifariş detalını gör | ✅ | ✅ (öz məhsulları) | ✅ (öz sifarişi) |
| Sifariş statusunu dəyiş | ✅ | ❌ | ❌ |
| Sifarişi ləğv et (PENDING) | ✅ | ❌ | ✅ |
| İzləmə nömrəsi əlavə et | ✅ | ❌ | ❌ |
| Sifariş yarat | ❌ | ❌ | ✅ |

---

### 2.5 Ödəniş

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Ödəniş intent yarat | ❌ | ❌ | ✅ |
| Ödənişi təsdiq et | ❌ | ❌ | ✅ |
| Geri ödəniş (refund) | ✅ | ❌ | ❌ |
| Stripe webhook emal | ✅ (sistem) | — | — |

---

### 2.6 Səbət İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Səbəti gör | ❌ | ❌ | ✅ |
| Məhsul əlavə et | ❌ | ❌ | ✅ |
| Miqdarı dəyiş | ❌ | ❌ | ✅ |
| Məhsul çıxar | ❌ | ❌ | ✅ |
| Səbəti təmizlə | ❌ | ❌ | ✅ |

---

### 2.7 Rəy İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Bütün rəyləri gör | ✅ | ❌ | ❌ |
| Rəy yaz | ❌ | ❌ | ✅ (alqısı olanlar) |
| Rəyi təsdiq/rədd et | ✅ | ❌ | ❌ |
| Rəyi sil | ✅ | ❌ | ❌ |
| Öz rəyini gör | ❌ | ❌ | ✅ |

---

### 2.8 Kupon İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Bütün kuponları gör | ✅ | ❌ | ❌ |
| Kupon yarat | ✅ | ❌ | ❌ |
| Kuponu yenilə | ✅ | ❌ | ❌ |
| Kuponu sil | ✅ | ❌ | ❌ |
| Kupon kodunu yoxla | ✅ | ✅ | ✅ |

---

### 2.9 İstək Siyahısı

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Öz istək siyahısını gör | ❌ | ❌ | ✅ |
| Məhsul əlavə et | ❌ | ❌ | ✅ |
| Məhsul çıxar | ❌ | ❌ | ✅ |

---

### 2.10 Ünvan İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Öz ünvanlarını gör | ❌ | ❌ | ✅ |
| Ünvan əlavə et | ❌ | ❌ | ✅ |
| Ünvanı yenilə | ❌ | ❌ | ✅ |
| Ünvanı sil | ❌ | ❌ | ✅ |
| Default ünvan seç | ❌ | ❌ | ✅ |

---

### 2.11 Vendor İdarəsi

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Bütün vendorları gör | ✅ | ❌ | ❌ |
| Vendor müraciəti et | ❌ | ❌ | ✅ |
| Vendor müraciətini təsdiq/rədd et | ✅ | ❌ | ❌ |
| Vendor statusunu dəyiş | ✅ | ❌ | ❌ |
| Öz vendor profilini yenilə | ❌ | ✅ | ❌ |
| Öz vendor statistikasını gör | ❌ | ✅ | ❌ |

---

### 2.12 Analitika & Parametrlər

| Əməliyyat | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Sistem analitikasını gör | ✅ | ❌ | ❌ |
| Öz satış analitikasını gör | ❌ | ✅ | ❌ |
| Sayt parametrlərini idarə et | ✅ | ❌ | ❌ |

---

### 2.13 Dashboard Göstəriciləri

| Göstərici | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Ümumi gəlir | ✅ | ❌ | ❌ |
| Ümumi sifariş sayı | ✅ | ❌ | ❌ |
| Ümumi müştəri sayı | ✅ | ❌ | ❌ |
| Ümumi məhsul sayı | ✅ | ❌ | ❌ |
| Satış qrafiki (sistem) | ✅ | ❌ | ❌ |
| Öz mağazasının gəliri | ❌ | ✅ | ❌ |
| Öz məhsullarının sayı | ❌ | ✅ | ❌ |
| Gözləyən sifarişlər | ❌ | ✅ | ❌ |
| Öz sifarişlərinin sayı | ❌ | ❌ | ✅ |
| Gözləyən çatdırılmalar | ❌ | ❌ | ✅ |
| Toplam xərcim | ❌ | ❌ | ✅ |

---

## 3. Naviqasiya — Rola Görə

### Admin Sidebar
```
Dashboard · Məhsullar · Kateqoriyalar · Sifarişlər
Müştərilər · Vendorlar · Kuponlar · Rəylər
Analitika · Parametrlər · Profil
```

### Vendor Sidebar
```
Dashboard · Məhsullarım · Sifarişlərim · Mağazam · Profil
```

### Customer Navbar (Top + Bottom Tabs)
```
[Ana Səhifə] [Axtarış] [İstək Siyahısı] [Profil + Sifarişlər]
Səbət (header-də) · Checkout
```

---

## 4. Backend — Route Qoruması (TypeScript)

```typescript
// src/routes/productRoutes.ts

import { Router }    from 'express';
import { protect }   from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct,
}                    from '../controllers/productController';
import {
  productImageUpload,
}                    from '../middleware/uploadMiddleware';
import { validate }  from '../middleware/validate';
import {
  createProductValidation,
}                    from '../validators/productValidators';

const router = Router();

// ── Public ────────────────────────────────────────────────
router.get('/',          getProducts);
router.get('/featured',  getFeaturedProducts);
router.get('/search',    searchProducts);
router.get('/:slug',     getProduct);

// ── Admin + Vendor ────────────────────────────────────────
router.post(
  '/',
  protect,
  authorize('ADMIN', 'VENDOR'),
  productImageUpload.array('images', 5),
  createProductValidation,
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('ADMIN', 'VENDOR'),
  updateProduct           // Controller daxilində vendor öz məhsulunu yoxlayır
);

router.delete(
  '/:id',
  protect,
  authorize('ADMIN', 'VENDOR'),
  deleteProduct
);

export default router;
```

```typescript
// src/routes/orderRoutes.ts

const router = Router();

// ── Admin ─────────────────────────────────────────────────
router.get(
  '/',
  protect,
  authorize('ADMIN'),
  getAllOrders
);

router.patch(
  '/:id/status',
  protect,
  authorize('ADMIN'),
  updateOrderStatus
);

// ── Vendor ────────────────────────────────────────────────
router.get(
  '/vendor',
  protect,
  authorize('VENDOR'),
  getVendorOrders
);

// ── Customer ──────────────────────────────────────────────
router.get(
  '/my',
  protect,
  authorize('CUSTOMER'),
  getMyOrders
);

router.post(
  '/',
  protect,
  authorize('CUSTOMER'),
  createOrder
);

router.post(
  '/:id/cancel',
  protect,
  authorize('ADMIN', 'CUSTOMER'),
  cancelOrder
);

// ── Admin + Customer (öz sifarişi) ────────────────────────
router.get(
  '/:id',
  protect,
  getOrderById                // Controller daxilində ownership yoxlanır
);

export default router;
```

```typescript
// src/routes/reviewRoutes.ts

const router = Router();

// Public — məhsulun rəylərini gör
router.get('/', getReviews);

// Customer — rəy yaz (alqısı yoxlanır)
router.post(
  '/',
  protect,
  authorize('CUSTOMER'),
  createReview
);

// Admin — moderasiya
router.patch(
  '/:id/approve',
  protect,
  authorize('ADMIN'),
  approveReview
);

router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  deleteReview
);

export default router;
```

---

## 5. Controller — Data Filterlənməsi (TypeScript)

```typescript
// src/controllers/productController.ts
// Vendor yalnız öz məhsullarını idarə edə bilər

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where:  { id: req.params.id },
      select: { id: true, vendorId: true },
    });

    if (!product) {
      throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');
    }

    // Vendor yalnız öz məhsulunu dəyişə bilər
    if (req.user!.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user!.id },
      });

      if (product.vendorId !== vendor?.id) {
        throw new AppError(
          'Yalnız öz məhsullarınızı dəyişə bilərsiniz',
          403,
          'FORBIDDEN'
        );
      }
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

```typescript
// src/controllers/orderController.ts
// Customer yalnız öz sifarişini görə bilər

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await prisma.order.findUnique({
      where:   { id: req.params.id },
      include: {
        items:   { include: { product: { select: { name: true, images: { take: 1 } } } } },
        address: true,
        user:    { select: { name: true, email: true } },
        coupon:  { select: { code: true, type: true, value: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      throw new AppError('Sifariş tapılmadı', 404, 'NOT_FOUND');
    }

    // Customer yalnız öz sifarişini görə bilər
    if (
      req.user!.role === 'CUSTOMER' &&
      order.userId !== req.user!.id
    ) {
      throw new AppError('Bu sifarişə giriş icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    successResponse(res, { data: order });
  }
);
```

```typescript
// src/controllers/reviewController.ts
// Customer yalnız aldığı məhsula rəy yaza bilər

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, rating, title, body } = req.body;

    // Artıq rəy yazıbmı?
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.user!.id, productId } },
    });

    if (existing) {
      throw new AppError(
        'Bu məhsula artıq rəy yazıbsınız',
        422,
        'ALREADY_REVIEWED'
      );
    }

    // Məhsulu alıbmı? (təsdiqlənmiş sifariş)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId:        req.user!.id,
          paymentStatus: 'PAID',
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        userId:     req.user!.id,
        productId,
        rating,
        title,
        body,
        isApproved: false,
        isVerified: !!hasPurchased,    // Alqı təsdiqlənibsə verified
      },
    });

    successResponse(res, {
      statusCode: 201,
      message:    'Rəyiniz moderasiya üçün göndərildi',
      data:       { id: review.id, isApproved: false },
    });
  }
);
```

---

## 6. Frontend — useRole Hook (TypeScript)

```typescript
// src/hooks/useRole.ts
'use client';

import { useAuthStore } from '@/store/authStore';

interface RoleState {
  role:       string | undefined;
  isAdmin:    boolean;
  isVendor:   boolean;
  isCustomer: boolean;
  isLoggedIn: boolean;
}

export const useRole = (): RoleState => {
  const { user } = useAuthStore();

  return {
    role:       user?.role,
    isAdmin:    user?.role === 'ADMIN',
    isVendor:   user?.role === 'VENDOR',
    isCustomer: user?.role === 'CUSTOMER',
    isLoggedIn: !!user,
  };
};
```

---

## 7. Frontend — Naviqasiya Elementləri (TypeScript)

```typescript
// src/components/layout/navItems.ts

import {
  LayoutDashboard, Package, Tag, ShoppingBag,
  Users, Store, Ticket, Star, BarChart3,
  Settings, User,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path:  string;
  icon:  LucideIcon;
  roles: string[];
}

export const getNavItems = (role: string): NavItem[] =>
  [
    // ── Admin ──────────────────────────────────────────────
    {
      label: 'Dashboard',
      path:  '/admin',
      icon:  LayoutDashboard,
      roles: ['ADMIN'],
    },
    {
      label: 'Məhsullar',
      path:  '/admin/products',
      icon:  Package,
      roles: ['ADMIN'],
    },
    {
      label: 'Kateqoriyalar',
      path:  '/admin/categories',
      icon:  Tag,
      roles: ['ADMIN'],
    },
    {
      label: 'Sifarişlər',
      path:  '/admin/orders',
      icon:  ShoppingBag,
      roles: ['ADMIN'],
    },
    {
      label: 'Müştərilər',
      path:  '/admin/customers',
      icon:  Users,
      roles: ['ADMIN'],
    },
    {
      label: 'Vendorlar',
      path:  '/admin/vendors',
      icon:  Store,
      roles: ['ADMIN'],
    },
    {
      label: 'Kuponlar',
      path:  '/admin/coupons',
      icon:  Ticket,
      roles: ['ADMIN'],
    },
    {
      label: 'Rəylər',
      path:  '/admin/reviews',
      icon:  Star,
      roles: ['ADMIN'],
    },
    {
      label: 'Analitika',
      path:  '/admin/analytics',
      icon:  BarChart3,
      roles: ['ADMIN'],
    },
    {
      label: 'Parametrlər',
      path:  '/admin/settings',
      icon:  Settings,
      roles: ['ADMIN'],
    },

    // ── Vendor ─────────────────────────────────────────────
    {
      label: 'Dashboard',
      path:  '/vendor',
      icon:  LayoutDashboard,
      roles: ['VENDOR'],
    },
    {
      label: 'Məhsullarım',
      path:  '/vendor/products',
      icon:  Package,
      roles: ['VENDOR'],
    },
    {
      label: 'Sifarişlər',
      path:  '/vendor/orders',
      icon:  ShoppingBag,
      roles: ['VENDOR'],
    },
    {
      label: 'Mağazam',
      path:  '/vendor/store',
      icon:  Store,
      roles: ['VENDOR'],
    },

    // ── Hamı (admin + vendor panelinin alt hissəsi) ────────
    {
      label: 'Profil',
      path:  '/profile',
      icon:  User,
      roles: ['ADMIN', 'VENDOR'],
    },
  ].filter((item) => item.roles.includes(role));
```

---

## 8. Frontend — Komponentdə Rol Yoxlaması

```tsx
// src/app/[locale]/(shop)/products/[slug]/page.tsx

'use client';

import { useRole } from '@/hooks/useRole';

export default function ProductDetailPage() {
  const { isAdmin, isVendor, isCustomer, isLoggedIn } = useRole();

  return (
    <div>
      <h1>{product.name}</h1>

      {/* Hamı görür */}
      <p>{product.description}</p>
      <p>₼{product.price}</p>

      {/* Yalnız Customer */}
      {isCustomer && (
        <button onClick={addToCart}>
          Səbətə əlavə et
        </button>
      )}

      {/* Yalnız Customer (login olub) */}
      {isCustomer && (
        <button onClick={addToWishlist}>
          İstək siyahısına əlavə et
        </button>
      )}

      {/* Admin və Vendor (məhsul sahibi) */}
      {(isAdmin || isVendor) && (
        <div className="admin-actions">
          <button onClick={editProduct}>Düzəlt</button>
          <button onClick={deleteProduct}>Sil</button>
        </div>
      )}

      {/* Yalnız Admin */}
      {isAdmin && (
        <label>
          <input
            type="checkbox"
            checked={product.isFeatured}
            onChange={toggleFeatured}
          />
          Öne Çıxan
        </label>
      )}

      {/* Rəy bölməsi — yalnız login olan Customer */}
      {isCustomer && (
        <ReviewForm productId={product.id} />
      )}

      {/* Login olmayan — giriş düyməsi */}
      {!isLoggedIn && (
        <p>
          Rəy yazmaq üçün <a href="/login">daxil olun</a>
        </p>
      )}
    </div>
  );
}
```

---

## 9. Frontend — Route Qoruması (Next.js Middleware)

```typescript
// middleware.ts — root qovluqda

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale       = request.cookies.get('NEXT_LOCALE')?.value ?? 'az';

  // Cookie-dən user rolunu oxu (JWT decode etmədən yüngül yoxlama)
  const userRole = request.cookies.get('userRole')?.value;
  const hasAuth  = request.cookies.get('refreshToken')?.value;

  // ── Admin route qoruması ────────────────────────────────
  if (pathname.includes('/admin')) {
    if (!hasAuth || userRole !== 'ADMIN') {
      return NextResponse.redirect(
        new URL(`/${locale}/login?redirect=${pathname}`, request.url)
      );
    }
  }

  // ── Vendor route qoruması ───────────────────────────────
  if (pathname.includes('/vendor')) {
    if (!hasAuth || userRole !== 'VENDOR') {
      return NextResponse.redirect(
        new URL(`/${locale}/login?redirect=${pathname}`, request.url)
      );
    }
  }

  // ── Checkout + Sifarişlər — login tələb olunur ──────────
  if (
    pathname.includes('/checkout') ||
    pathname.includes('/orders')   ||
    pathname.includes('/profile')  ||
    pathname.includes('/wishlist')
  ) {
    if (!hasAuth) {
      return NextResponse.redirect(
        new URL(`/${locale}/login?redirect=${pathname}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(az|en|ru)/admin/:path*',
    '/(az|en|ru)/vendor/:path*',
    '/(az|en|ru)/checkout',
    '/(az|en|ru)/orders/:path*',
    '/(az|en|ru)/profile/:path*',
    '/(az|en|ru)/wishlist',
  ],
};
```

---

## 10. Xüsusi Qaydalar

### Vendor Onboarding Axını
```
Customer "Vendor ol" müraciəti edir
    │  POST /api/vendors/apply
    ▼
Vendor yaradılır — status: PENDING
    │  İstifadəçi rolu CUSTOMER olaraq qalır
    ▼
Admin bildiriş alır (email)
    │  PATCH /api/vendors/:id/status { status: "APPROVED" }
    ▼
Vendor təsdiqlənir — status: APPROVED
    │  User.role → VENDOR olaraq yenilənir
    ▼
Vendor öz məhsullarını əlavə edə bilər
```

### Admin Özünü Dəyişdirə Bilmir
```typescript
// src/controllers/userController.ts

// Admin öz rolunu dəyişdirə bilməz
if (req.params.id === req.user!.id && req.body.role) {
  throw new AppError(
    'Öz rolunuzu dəyişdirə bilməzsiniz',
    403,
    'FORBIDDEN'
  );
}

// Admin özünü deaktiv edə bilməz
if (req.params.id === req.user!.id && req.body.isActive === false) {
  throw new AppError(
    'Öz hesabınızı deaktiv edə bilməzsiniz',
    403,
    'FORBIDDEN'
  );
}
```

### Vendor Onaylı Olmalıdır
```typescript
// src/middleware/vendorMiddleware.ts

export const requireApprovedVendor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const vendor = await prisma.vendor.findUnique({
      where:  { userId: req.user!.id },
      select: { status: true },
    });

    if (!vendor || vendor.status !== 'APPROVED') {
      throw new AppError(
        'Vendor hesabınız hələ təsdiqlənməyib',
        403,
        'VENDOR_NOT_APPROVED'
      );
    }

    next();
  }
);

// Route-da istifadə:
// router.post('/', protect, authorize('VENDOR'), requireApprovedVendor, createProduct);
```

---

## 11. Sürətli Keçid Cədvəli

| Xüsusiyyət | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Panel növü | Admin Panel | Vendor Panel | Public Mağaza |
| Sidebar elementləri | 10 | 4 | — (Bottom Tabs) |
| Məhsul CRUD | ✅ (hamısı) | ✅ (öz) | ❌ |
| Sifariş idarəsi | ✅ (hamısı) | ✅ (öz) | ✅ (öz) |
| Ödəniş | ❌ | ❌ | ✅ |
| Kupon yarat | ✅ | ❌ | ❌ |
| Rəy moderasiyası | ✅ | ❌ | ❌ |
| Rəy yaz | ❌ | ❌ | ✅ |
| Vendor onboard | ✅ (təsdiq) | — | ✅ (müraciət) |
| Analitika | ✅ (sistem) | ✅ (öz) | ❌ |
| Sayt parametrləri | ✅ | ❌ | ❌ |
| Profil + Ünvan | ✅ | ✅ | ✅ |
