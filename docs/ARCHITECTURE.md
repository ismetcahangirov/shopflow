# ARCHITECTURE.md — Texniki Arxitektura

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Ümumi Baxış

ShopFlow **üçlü arxitektura** (three-tier) üzərində qurulur. Hər hissə bir-birindən
tam ayrılmış və yalnız müəyyən protokollar vasitəsilə əlaqə saxlayır.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│              Next.js 14 + TypeScript (App Router)               │
│          SSG / SSR / ISR / CSR — Vercel Edge Network            │
│                       localhost:3000                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTPS / REST API (Axios)
                           │  JWT Bearer Token
                           │  Cookie (refresh token)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                             │
│              Node.js 20 + Express.js + TypeScript               │
│                       localhost:5000                            │
└──────┬───────────────────┬────────────────────────┬────────────┘
       │                   │                        │
       ▼                   ▼                        ▼
┌────────────┐    ┌─────────────────┐    ┌──────────────────────┐
│  DATABASE  │    │   CLOUDINARY    │    │       STRIPE         │
│  Supabase  │    │  Media Storage  │    │  Payment + Webhook   │
│ PostgreSQL │    │   (CDN + API)   │    │                      │
│  (Prisma)  │    └─────────────────┘    └──────────────────────┘
└────────────┘
```

---

## 2. Frontend Arxitekturası (Next.js 14)

### 2.1 Texnologiya Seçiminin Əsaslandırılması

| Texnologiya | Niyə seçildi |
|---|---|
| **Next.js 14 App Router** | SSG+ISR+SSR eyni proyektdə — SEO + performans optimal balans |
| **TypeScript** | Type-safe development, IDE dəstəyi, refactoring güvənliyi |
| **Tailwind CSS** | Utility-first, responsive, JIT compiler ilə sıfır unused CSS |
| **Shadcn/ui** | Accessible, unstyled base, tam Tailwind ilə uyğun |
| **Zustand** | Yüngül client state (səbət, auth) — Redux boilerplate-siz |
| **TanStack Query v5** | Server state, automatic background refetch, optimistic updates |
| **React Hook Form + Zod** | Performanslı form, type-safe validation, backend ilə paylaşılan schema |
| **next-intl** | App Router ilə native inteqrasiya, SEO-friendly URL prefiksi |
| **next-sitemap** | Dinamik sitemap.xml + robots.txt avtomatik generasiya |

---

### 2.2 Next.js App Router Strukturu

```
src/app/
├── [locale]/                    ← next-intl: az | en | ru
│   │
│   ├── (auth)/                  ← Route Group — layout yoxdur
│   │   ├── login/
│   │   │   ├── page.tsx         ← CSR (Client Component)
│   │   │   └── loading.tsx
│   │   └── register/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   │
│   ├── (shop)/                  ← Route Group — Navbar + Footer layout
│   │   ├── layout.tsx           ← <Navbar /> + <Footer /> + <Providers />
│   │   │
│   │   ├── page.tsx             ← Ana səhifə
│   │   │                          Rendering: SSG + ISR (revalidate: 3600)
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx         ← Məhsul siyahısı
│   │   │   │                      Rendering: SSR (searchParams dəyişkən)
│   │   │   ├── loading.tsx      ← Skeleton UI
│   │   │   └── [slug]/
│   │   │       ├── page.tsx     ← Məhsul detalı
│   │   │       │                  Rendering: SSG + ISR (revalidate: 1800)
│   │   │       │                  generateStaticParams() — populyar məhsullar
│   │   │       │                  generateMetadata() — dinamik SEO
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx
│   │   │
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx     ← SSG + ISR (revalidate: 3600)
│   │   │       └── loading.tsx
│   │   │
│   │   ├── search/
│   │   │   └── page.tsx         ← SSR (q= parametri)
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx         ← CSR (Zustand cartStore)
│   │   │
│   │   ├── checkout/
│   │   │   └── page.tsx         ← CSR + Stripe Elements
│   │   │
│   │   ├── order/
│   │   │   └── success/
│   │   │       └── [id]/
│   │   │           └── page.tsx ← SSR (session_id yoxlama)
│   │   │
│   │   ├── orders/
│   │   │   ├── page.tsx         ← SSR (auth required)
│   │   │   └── [id]/
│   │   │       └── page.tsx     ← SSR
│   │   │
│   │   ├── wishlist/
│   │   │   └── page.tsx         ← CSR
│   │   │
│   │   └── profile/
│   │       ├── page.tsx         ← CSR
│   │       └── addresses/
│   │           └── page.tsx     ← CSR
│   │
│   ├── admin/                   ← Admin panel
│   │   ├── layout.tsx           ← AdminSidebar + Header (auth check)
│   │   ├── page.tsx             ← Dashboard — SSR
│   │   ├── products/
│   │   │   ├── page.tsx         ← SSR
│   │   │   ├── new/page.tsx     ← CSR (forma)
│   │   │   └── [id]/
│   │   │       └── edit/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── vendors/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   │
│   └── vendor/                  ← Vendor panel
│       ├── layout.tsx
│       ├── page.tsx
│       ├── products/
│       ├── orders/
│       └── store/
│
├── api/                         ← Next.js Route Handlers
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts         ← Google OAuth callback (NextAuth.js)
│   └── webhooks/
│       └── stripe/
│           └── route.ts         ← Stripe webhook endpoint
│
└── layout.tsx                   ← Root layout: font, metadata, providers
```

---

### 2.3 Rendering Strategiyası (Ətraflı)

```
RENDERING QƏRAR AĞACI:

  SEO lazımdır?
  ├── Bəli → Data statik/yarı-statikdır?
  │           ├── Bəli → SSG + ISR ✅
  │           │           (Ana səhifə, Məhsul detalı, Kateqoriya)
  │           └── Xeyr → SSR ✅
  │                       (Siyahı+filter, Axtarış, Sifarişlər)
  └── Xeyr → Auth arxasındadır?
              ├── Bəli → CSR ✅
              │           (Səbət, Checkout, Profil, Admin panel)
              └── Xeyr → CSR ✅
                          (Dil seçici, Theme toggle)
```

| Səhifə | Metod | `revalidate` | Səbəb |
|---|---|---|---|
| Ana səhifə | SSG + ISR | 3600s | Kampaniyalar dəyişə bilər |
| Məhsul detalı | SSG + ISR | 1800s | Qiymət/stok dəyişə bilər |
| Kateqoriya | SSG + ISR | 3600s | Struktur sabitdir |
| Məhsul siyahısı | SSR | — | `?sort=&brand=&min=` dəyişkən |
| Axtarış | SSR | — | `?q=` hər zaman fərqli |
| Sifariş detalı | SSR | — | Auth + real-time status |
| Checkout | CSR | — | Stripe Elements server-side render olmur |
| Səbət | CSR | — | Zustand client state |

---

### 2.4 State Management Arxitekturası

```
┌─────────────────────────────────────────────────────────┐
│                    STATE KATEQORİYALARI                 │
├────────────────────┬────────────────────────────────────┤
│  CLIENT STATE      │  SERVER STATE                      │
│  (Zustand)         │  (TanStack Query)                  │
│                    │                                    │
│  • authStore       │  • Products (cache: 5 dəq)         │
│    - user          │  • Categories (cache: 10 dəq)      │
│    - token         │  • Orders (cache: 1 dəq)           │
│    - isAuth        │  • Reviews (cache: 5 dəq)          │
│                    │  • Dashboard stats (cache: 1 dəq)  │
│  • cartStore       │  • User profile (cache: 2 dəq)     │
│    - items[]       │                                    │
│    - total         │  → Avtomatik background refetch    │
│    - count         │  → Optimistic updates              │
│    - addItem()     │  → Error retry (3x)                │
│    - removeItem()  │  → Stale-while-revalidate          │
│    - clearCart()   │                                    │
│                    │                                    │
│  • uiStore         │                                    │
│    - sidebarOpen   │                                    │
│    - theme         │                                    │
│    - searchOpen    │                                    │
└────────────────────┴────────────────────────────────────┘
```

**Zustand persist (localStorage):**
```typescript
// store/cartStore.ts — səbət localStorage-da qalır
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:      [],
      addItem:    (product, qty) => { /* ... */ },
      removeItem: (productId)   => { /* ... */ },
      clearCart:  ()            => set({ items: [] }),
      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
      },
    }),
    {
      name:    'shopflow-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

### 2.5 Data Flow (Məlumat Axını)

#### Tipik Məhsul Siyahısı Sorğusu

```
İstifadəçi filter dəyişdirir
          │
          ▼
ProductFilters component
(URL searchParams yenilənir)
          │
          ▼
useProducts() hook
(TanStack Query)
          │
          ├── Cache var? (5 dəq keçməyib?)
          │     ├── Bəli  → cache-dən qaytarır (0ms)
          │     └── Xeyr  → API sorğusu göndərir
          │
          ▼
Axios Instance (lib/api.ts)
+ Authorization header əlavə edilir
          │
          ▼
Express API — GET /api/products?page=1&brand=apple&min=100
          │
          ▼
authMiddleware (token yoxla)
          │
          ▼
productController.getProducts()
          │
          ▼
Prisma ORM
prisma.product.findMany({
  where: { brand: 'apple', price: { gte: 100 } },
  include: { images: true, category: true },
  skip: 0, take: 20
})
          │
          ▼
PostgreSQL (Supabase)
          │
          ▼
JSON Response → TanStack Query cache
          │
          ▼
ProductGrid component yenilənir
```

#### Stripe Ödəniş Axını

```
Customer "Ödə" düyməsinə basır
          │
          ▼
POST /api/payments/create-intent
(server: Stripe PaymentIntent yaradır)
          │
          ▼
client_secret → frontend-ə qaytarılır
          │
          ▼
Stripe Elements (kart məlumatları)
          │
          ▼
stripe.confirmPayment() — Stripe serverinə göndərilir
          │
          ├── Uğurlu → /order/success/[id]
          │
          └── Stripe Webhook (POST /api/webhooks/stripe)
                    │
                    ▼
              payment_intent.succeeded event
                    │
                    ▼
              Order status → 'PAID'
              Stok azaldılır
              Email göndərilir (Resend)
```

---

### 2.6 SEO Arxitekturası

```
┌─────────────────────────────────────────────────────┐
│                  SEO LAYERLARI                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. METADATA (generateMetadata)                     │
│     • title, description, keywords                  │
│     • openGraph (Facebook, WhatsApp)                │
│     • twitter (Twitter Card)                        │
│     • alternates (canonical + hreflang)             │
│     • robots (index/noindex)                        │
│                                                     │
│  2. STRUKTURLAŞDIRILMIŞ DATA (JSON-LD)              │
│     • Product schema (qiymət, stok, reytinq)        │
│     • BreadcrumbList schema                         │
│     • Organization schema (ana səhifə)              │
│     • WebSite schema + SearchAction                 │
│                                                     │
│  3. TEXNİKİ SEO                                     │
│     • next-sitemap → /sitemap.xml                   │
│     • /robots.txt (admin/* noindex)                 │
│     • Canonical URL (duplicate content yoxdur)      │
│     • 301 redirect (köhnə URL-lər)                  │
│                                                     │
│  4. PERFORMANS (Core Web Vitals)                    │
│     • LCP: next/image + Cloudinary CDN              │
│     • CLS: şəkil ölçüləri əvvəlcədən məlum         │
│     • FID: minimal JS bundle (Zustand yüngüldür)   │
│     • next/font → FOUT yoxdur                       │
│                                                     │
│  5. DİL / BEYNƏLXALQ                               │
│     • /az/ /en/ /ru/ URL struktura                 │
│     • hreflang="az" | "en" | "ru" | "x-default"    │
│     • Hər dil üçün ayrı sitemap                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Backend Arxitekturası (Express + TypeScript)

### 3.1 Texnologiya Seçiminin Əsaslandırılması

| Texnologiya | Niyə seçildi |
|---|---|
| **Express.js + TypeScript** | Yüngül, çevik, geniş ekosistem, Next.js ilə eyni dil |
| **Prisma ORM** | Type-safe, avtomatik migration, güclü studio, PostgreSQL-ə ideal |
| **PostgreSQL** | ACID, relational data (sifariş→məhsul→istifadəçi), JSON dəstəyi |
| **Supabase** | Pulsuz 500MB, silinmir, built-in auth (opsional), real-time |
| **Winston** | Strukturlaşdırılmış JSON log, level-based, production-ready |
| **Resend** | Müasir email API, yüksək deliverability, 3000/ay pulsuz |
| **Cloudinary** | Avtomatik WebP/AVIF, CDN, transformasiya API |

---

### 3.2 Request Lifecycle (Sorğu Həyat Dövrü)

```
HTTP Request (client → server)
        │
        ▼
server.ts — Express App
        │
        ├── morgan()              Log: "GET /api/products 200 45ms"
        ├── helmet()              Security headers əlavə et
        ├── cors(corsOptions)     Origin yoxla
        ├── express.json()        Body parse et
        ├── express.urlencoded()  Form data parse et
        ├── rateLimiter()         IP əsaslı limit yoxla
        │
        ▼
Route Handler
/api/products → productRoutes.ts
        │
        ├── authMiddleware.ts     JWT yoxla → req.user əlavə et
        ├── roleMiddleware.ts     Rol icazəsi yoxla
        ├── validate.ts           express-validator + Zod yoxla
        │
        ▼
Controller Function
asyncHandler(async (req, res) => { ... })
        │
        ├── Prisma sorğusu
        ├── İş məntiqi
        ├── Cloudinary (lazımsa)
        └── successResponse(res, { data, message })
                │
                ▼
        HTTP Response
        {
          success: true,
          message: "...",
          data:    { ... },
          pagination: { page, limit, total, pages }
        }

XƏTA BAŞ VERİBSƏ:
        │
        ▼
errorMiddleware.ts (global handler)
        │
        ├── AppError → { success: false, error: "NOT_FOUND", statusCode: 404 }
        ├── Prisma xətası → 400 VALIDATION_ERROR
        ├── JWT xətası → 401 UNAUTHORIZED
        └── Naməlum xəta → 500 INTERNAL_ERROR (production-da detallar gizlədilir)
```

---

### 3.3 Qovluq Strukturu (Ətraflı)

```
server/
├── src/
│   ├── config/
│   │   ├── db.ts              ← Prisma Client singleton
│   │   │                         (global-da saxla — hot reload problem yoxdur)
│   │   ├── corsOptions.ts     ← İcazəli originlər siyahısı
│   │   ├── cloudinary.ts      ← Cloudinary v2 SDK konfiqurasiyası
│   │   ├── stripe.ts          ← Stripe SDK init
│   │   └── logger.ts          ← Winston: console + file transport
│   │
│   ├── controllers/           ← Biznes məntiqi (yalnız bu fayllarda)
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── productController.ts
│   │   ├── categoryController.ts
│   │   ├── orderController.ts
│   │   ├── cartController.ts
│   │   ├── reviewController.ts
│   │   ├── couponController.ts
│   │   ├── vendorController.ts
│   │   ├── wishlistController.ts
│   │   ├── addressController.ts
│   │   ├── paymentController.ts
│   │   └── analyticsController.ts
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts  ← JWT yoxla, req.user tipini genişləndir
│   │   ├── roleMiddleware.ts  ← authorize('admin', 'vendor') RBAC
│   │   ├── errorMiddleware.ts ← Global xəta tutma + formatlama
│   │   ├── rateLimiter.ts     ← express-rate-limit konfigurasiyaları
│   │   └── validate.ts        ← express-validator + Zod schema yoxlama
│   │
│   ├── routes/
│   │   ├── authRoutes.ts      ← /api/auth/*
│   │   ├── userRoutes.ts      ← /api/users/*
│   │   ├── productRoutes.ts   ← /api/products/*
│   │   ├── categoryRoutes.ts  ← /api/categories/*
│   │   ├── orderRoutes.ts     ← /api/orders/*
│   │   ├── cartRoutes.ts      ← /api/cart/*
│   │   ├── reviewRoutes.ts    ← /api/reviews/*
│   │   ├── couponRoutes.ts    ← /api/coupons/*
│   │   ├── vendorRoutes.ts    ← /api/vendors/*
│   │   ├── wishlistRoutes.ts  ← /api/wishlist/*
│   │   ├── addressRoutes.ts   ← /api/addresses/*
│   │   ├── paymentRoutes.ts   ← /api/payments/*
│   │   └── analyticsRoutes.ts ← /api/analytics/*
│   │
│   ├── utils/
│   │   ├── asyncHandler.ts    ← try/catch wrapper (controller-ləri təmiz saxlar)
│   │   ├── AppError.ts        ← Custom xəta sinifi (statusCode, errorCode)
│   │   ├── apiResponse.ts     ← successResponse(), errorResponse()
│   │   ├── generateToken.ts   ← JWT access + refresh token yaratma
│   │   ├── sendEmail.ts       ← Resend API wrapper
│   │   └── slugify.ts         ← "iPhone 15 Pro" → "iphone-15-pro"
│   │
│   ├── types/
│   │   ├── express.d.ts       ← req.user: { id, role, email } tipi
│   │   └── index.ts           ← Paylaşılan TypeScript interfeyslər
│   │
│   └── server.ts              ← Entry point
│
├── prisma/
│   ├── schema.prisma          ← Bütün cədvəllər + münasibətlər
│   ├── migrations/            ← Avtomatik yaradılan SQL migrasiyalar
│   └── seed.ts                ← Test data (admin, məhsullar, kateqoriyalar)
│
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
└── package.json
```

---

### 3.4 Prisma Data Modelləri

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?                          // Google OAuth-da null ola bilər
  role          Role      @default(CUSTOMER)
  avatar        String?
  googleId      String?   @unique
  isActive      Boolean   @default(true)
  isVerified    Boolean   @default(false)
  refreshToken  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // İlişkilər
  orders        Order[]
  reviews       Review[]
  wishlist      Wishlist[]
  addresses     Address[]
  vendor        Vendor?
  cart          Cart?

  @@index([email])
  @@index([role])
}

enum Role {
  ADMIN
  VENDOR
  CUSTOMER
}
```

#### Product
```prisma
model Product {
  id            String        @id @default(cuid())
  name          String
  slug          String        @unique
  description   String
  price         Decimal       @db.Decimal(10, 2)
  comparePrice  Decimal?      @db.Decimal(10, 2)  // Köhnə qiymət (endirim üçün)
  sku           String        @unique
  stock         Int           @default(0)
  brand         String?
  isActive      Boolean       @default(true)
  isFeatured    Boolean       @default(false)
  tags          String[]
  avgRating     Float         @default(0)
  reviewCount   Int           @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // İlişkilər
  categoryId    String
  category      Category      @relation(fields: [categoryId], references: [id])
  vendorId      String?
  vendor        Vendor?       @relation(fields: [vendorId], references: [id])
  images        ProductImage[]
  reviews       Review[]
  orderItems    OrderItem[]
  wishlist      Wishlist[]
  cartItems     CartItem[]
  attributes    ProductAttribute[]

  @@index([slug])
  @@index([categoryId])
  @@index([isActive, isFeatured])
  @@index([price])
}
```

#### Order
```prisma
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique  // "ORD-2026-00123"
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentMethod   String?
  stripePaymentId String?
  subtotal        Decimal       @db.Decimal(10, 2)
  shippingCost    Decimal       @db.Decimal(10, 2) @default(0)
  discount        Decimal       @db.Decimal(10, 2) @default(0)
  total           Decimal       @db.Decimal(10, 2)
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // İlişkilər
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  addressId       String
  address         Address       @relation(fields: [addressId], references: [id])
  items           OrderItem[]
  couponId        String?
  coupon          Coupon?       @relation(fields: [couponId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
  PARTIALLY_REFUNDED
}
```

#### Category
```prisma
model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?
  isActive    Boolean    @default(true)
  sortOrder   Int        @default(0)

  // Özünə referans — alt kateqoriyalar
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]

  @@index([slug])
  @@index([parentId])
}
```

#### Digər Modellər (Qısa)
```prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5
  title     String?
  body      String
  isApproved Boolean @default(false)
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  @@unique([userId, productId])   // Bir istifadəçi bir məhsula bir rəy
}

model Coupon {
  id            String      @id @default(cuid())
  code          String      @unique
  type          CouponType  // PERCENTAGE | FIXED_AMOUNT
  value         Decimal     @db.Decimal(10, 2)
  minOrderValue Decimal?    @db.Decimal(10, 2)
  maxUses       Int?
  usedCount     Int         @default(0)
  isActive      Boolean     @default(true)
  expiresAt     DateTime?
  orders        Order[]
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  updatedAt DateTime   @updatedAt
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  @@unique([userId, productId])
}

model Address {
  id         String  @id @default(cuid())
  fullName   String
  phone      String
  city       String
  district   String
  street     String
  zip        String?
  isDefault  Boolean @default(false)
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  orders     Order[]
}

model Vendor {
  id          String    @id @default(cuid())
  storeName   String
  slug        String    @unique
  description String?
  logo        String?
  isApproved  Boolean   @default(false)
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  products    Product[]
}
```

---

### 3.5 API Cavab Formatı (Standart)

```typescript
// utils/apiResponse.ts

// ── Uğurlu cavab ─────────────────────────────────────
successResponse(res, {
  message:    'Məhsullar uğurla əldə edildi',
  data:       products,
  pagination: { page: 1, limit: 20, total: 145, pages: 8 },
});

// JSON çıxışı:
{
  "success":    true,
  "message":    "Məhsullar uğurla əldə edildi",
  "data":       [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 145, "pages": 8 }
}

// ── Xəta cavabı ──────────────────────────────────────
throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');

// JSON çıxışı:
{
  "success":    false,
  "message":    "Məhsul tapılmadı",
  "error":      "NOT_FOUND",
  "statusCode": 404
}

// ── Validasiya xətası ─────────────────────────────────
{
  "success":    false,
  "message":    "Daxil edilən məlumat yanlışdır",
  "error":      "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    { "field": "price",  "message": "Qiymət müsbət olmalıdır" },
    { "field": "stock",  "message": "Stok tam ədəd olmalıdır" }
  ]
}
```

---

### 3.6 Controller Nümunəsi (TypeScript)

```typescript
// controllers/productController.ts

import { Request, Response }   from 'express';
import { asyncHandler }        from '../utils/asyncHandler';
import { AppError }            from '../utils/AppError';
import { successResponse }     from '../utils/apiResponse';
import { prisma }              from '../config/db';

export const getProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where:   { slug, isActive: true },
      include: {
        images:   true,
        category: { select: { id: true, name: true, slug: true } },
        vendor:   { select: { id: true, storeName: true, slug: true } },
        reviews: {
          where:   { isApproved: true },
          take:    10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });

    if (!product) {
      throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');
    }

    successResponse(res, {
      message: 'Məhsul uğurla əldə edildi',
      data:    product,
    });
  }
);

export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page     = '1',
      limit    = '20',
      category,
      brand,
      minPrice,
      maxPrice,
      sort     = 'createdAt_desc',
      search,
    } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const [sortField, sortOrder] = sort.split('_') as [string, 'asc' | 'desc'];

    const where = {
      isActive:  true,
      ...(category && { category: { slug: category } }),
      ...(brand    && { brand }),
      ...(search   && {
        OR: [
          { name:        { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { brand:       { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      price: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      },
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { images: { take: 1 }, category: { select: { name: true } } },
        orderBy: { [sortField]: sortOrder },
        skip,
        take:    limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    successResponse(res, {
      message:    'Məhsullar uğurla əldə edildi',
      data:       products,
      pagination: {
        page:  pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);
```

---

## 4. Təhlükəsizlik Arxitekturası

```
┌──────────────────────────────────────────────────────┐
│  LAYER 1 — NETWORK                                   │
│  HTTPS (Vercel + Render SSL), Cloudflare (opsional)  │
├──────────────────────────────────────────────────────┤
│  LAYER 2 — HTTP HEADERS                              │
│  Helmet: CSP, HSTS, X-Frame-Options, noSniff         │
├──────────────────────────────────────────────────────┤
│  LAYER 3 — CORS                                      │
│  Yalnız shopflow.az + localhost:3000                  │
├──────────────────────────────────────────────────────┤
│  LAYER 4 — RATE LIMITING                             │
│  Auth: 5/15dəq | API: 100/dəq | Upload: 10/saat     │
├──────────────────────────────────────────────────────┤
│  LAYER 5 — AUTHENTICATION                            │
│  JWT access (15dəq) + refresh (30 gün, httpOnly)     │
├──────────────────────────────────────────────────────┤
│  LAYER 6 — AUTHORIZATION                             │
│  RBAC: ADMIN | VENDOR | CUSTOMER                     │
├──────────────────────────────────────────────────────┤
│  LAYER 7 — INPUT VALIDATION                          │
│  express-validator + Zod (shared schema)             │
├──────────────────────────────────────────────────────┤
│  LAYER 8 — DATABASE                                  │
│  Prisma parametrized queries — SQL injection yoxdur  │
│  Supabase Row Level Security (opsional)              │
└──────────────────────────────────────────────────────┘
```

---

## 5. Performans Strategiyası

### Frontend
```
✅  ISR (revalidate) — statik şəkildə kəşlənmiş səhifələr
✅  TanStack Query — server state caching (5 dəq default)
✅  next/image — WebP/AVIF, lazy load, blur placeholder
✅  next/font — Font Optimization, FOUT yoxdur
✅  Code splitting — hər səhifə ayrı chunk
✅  Zustand — yüngül state (Redux boilerplate yoxdur)
✅  Debounce (300ms) — axtarış inputlarında
✅  Pagination — bütün siyahılarda (limit: 20/50)
✅  Cloudinary CDN — şəkil ən yaxın edge-dən gəlir
```

### Backend
```
✅  Prisma $transaction — atomic əməliyyatlar
✅  PostgreSQL indekslər — slug, categoryId, price, createdAt
✅  select/include — yalnız lazım olan sahələr
✅  Pagination (skip/take) — bütün siyahı endpointlərində
✅  Prisma connection pooling — veritabanı bağlantı idarəsi
✅  Winston structured logging — performans bottleneck-ləri tap
```

---

## 6. Miqyaslanma Planı (Gələcək)

| Addım | Texnologiya | Məqsəd | Nə vaxt |
|---|---|---|---|
| Caching | Redis (Upstash) | Session, hot product cache | 10k+ MAU |
| Search | Algolia / MeiliSearch | Tam mətn axtarışı | 1000+ məhsul |
| Queue | BullMQ | Email, stok yeniləmə, webhook | Yüksək trafik |
| CDN | Cloudflare | Global edge caching | Production |
| Monitoring | Sentry | Xəta izləmə, alertlər | Beta |
| Real-time | Pusher / Ably | Sifariş status yeniləmə | v2 |
| Microservices | — | Ödəniş servisini ayır | 100k+ MAU |
