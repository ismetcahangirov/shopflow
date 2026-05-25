# ShopFlow — E-Commerce Platform Sənədləşməsi

> **Versiya:** 1.0.0  
> **Status:** Planlaşdırma mərhələsi  
> **Son yenilənmə:** 2026  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)

---

## Layihə Haqqında

ShopFlow — müasir, tam funksional, SEO-optimallaşdırılmış e-commerce platformasıdır.
Sistem üç fərqli rol üçün interfeyslər təqdim edir: **Admin**, **Vendor** və **Customer**.

Layihə **Frontend** (Next.js 14 + TypeScript) və **Backend** (Node.js + Express + TypeScript)
olmaqla iki hissədən ibarətdir. Verilənlər bazası olaraq **PostgreSQL + Prisma ORM** istifadə olunur.

---

## Texnologiya Yığımı

### Frontend

| Texnologiya | Versiya | Məqsəd |
|---|---|---|
| Next.js | 14+ | React framework — App Router, SSR, SSG, ISR |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Utility-first styling |
| Shadcn/ui | latest | Hazır, accessible UI komponentləri |
| Lucide React | latest | İkon kitabxanası |
| Zustand | 4+ | Client state (səbət, auth, UI) |
| TanStack Query | 5+ | Server state, caching, background refetch |
| React Hook Form | 7+ | Performanslı form idarəsi |
| Zod | 3+ | Schema validation (backend ilə paylaşılır) |
| Axios | 1+ | HTTP client |
| next-intl | 3+ | Çoxdilli dəstək — AZ, EN, RU (SEO-friendly) |
| next-sitemap | 4+ | Sitemap.xml + robots.txt avtomatik generasiya |
| Stripe.js | latest | Ödəniş frontend inteqrasiyası |
| sharp | latest | Next.js Image Optimization (WebP/AVIF) |

### Backend

| Texnologiya | Versiya | Məqsəd |
|---|---|---|
| Node.js | 20+ | Runtime mühit |
| Express.js | 4+ | Web framework |
| TypeScript | 5+ | Type safety |
| tsx | latest | TypeScript executor |
| PostgreSQL | 16+ | Əsas relational verilənlər bazası |
| Prisma ORM | 5+ | Type-safe ORM, migration, seeding |
| JSON Web Token | 9+ | Autentifikasiya (access + refresh token) |
| bcryptjs | 2+ | Şifrə hashlanması |
| Resend | latest | Transactional email (3000/ay pulsuz) |
| Multer | 1+ | Fayl qəbulu (Cloudinary-ə ötürmə) |
| Cloudinary SDK | latest | Şəkil saxlama və transformasiya |
| Stripe | latest | Ödəniş emalı, webhook |
| Helmet | 7+ | HTTP security headers |
| CORS | 2+ | Cross-Origin idarəsi |
| Morgan | 1+ | HTTP request logging |
| Winston | 3+ | Strukturlaşdırılmış server logları |
| dotenv | 16+ | Mühit dəyişənləri |
| express-rate-limit | 7+ | Rate limiting |
| express-validator | 7+ | Request validasiyası |
| Jest + Supertest | 29+ | Test framework |

---

## SEO Strategiyası

Next.js 14 App Router e-commerce üçün ən güclü SEO imkanlarını təqdim edir.

### Rendering Strategiyaları

| Səhifə | Rendering | Səbəb |
|---|---|---|
| Ana səhifə | **SSG + ISR** (1 saat) | Statik, tez-tez dəyişmir |
| Məhsul siyahısı | **SSR** | Filter/axtarış parametrləri dəyişkən |
| Məhsul detalı | **SSG + ISR** (30 dəq) | SEO kritik, slug əsaslı |
| Kateqoriya | **SSG + ISR** (1 saat) | Statik struktur |
| Axtarış nəticələri | **SSR** | Dinamik, indekslənməməli |
| Admin / Vendor panel | **CSR** | Auth arxasında, SEO lazım deyil |
| Profil / Səbət | **CSR** | Şəxsi data, indekslənməməli |

### Metadata Sistemi

```typescript
// app/[locale]/(shop)/products/[slug]/page.tsx
export async function generateMetadata(
  { params }: { params: { slug: string; locale: string } }
): Promise<Metadata> {
  const product = await getProduct(params.slug);

  return {
    title:       `${product.name} | ShopFlow`,
    description: product.description.slice(0, 160),
    keywords:    product.tags.join(', '),
    openGraph: {
      title:       product.name,
      description: product.description.slice(0, 160),
      images:      [{ url: product.images[0], width: 1200, height: 630 }],
      type:        'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       product.name,
      description: product.description.slice(0, 160),
      images:      [product.images[0]],
    },
    alternates: {
      canonical: `https://shopflow.az/${params.locale}/products/${params.slug}`,
      languages: {
        'az': `/az/products/${params.slug}`,
        'en': `/en/products/${params.slug}`,
        'ru': `/ru/products/${params.slug}`,
      },
    },
  };
}
```

### Strukturlaşdırılmış Data (JSON-LD Schema.org)

```typescript
// components/shop/ProductSchema.tsx
export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        product.name,
    description: product.description,
    image:       product.images,
    sku:         product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type':       'Offer',
      price:          product.price,
      priceCurrency: 'AZN',
      availability:   product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type':      'AggregateRating',
      ratingValue:   product.avgRating,
      reviewCount:   product.reviewCount,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Tam SEO Tədbirlər Siyahısı

```
URL & NAVİQASİYA
  ✅  Məhsul URL-ləri slug əsaslı  →  /products/iphone-15-pro
  ✅  Kateqoriya slug               →  /category/elektronika
  ✅  Canonical URL hər səhifədə
  ✅  301 redirect — köhnə URL-lər
  ✅  Breadcrumb + BreadcrumbList JSON-LD

DİL / BEYNƏLXALQ
  ✅  next-intl ilə /az /en /ru URL prefiksi
  ✅  hreflang tag-ları bütün səhifələrdə
  ✅  Hər dil üçün ayrı sitemap.xml

METADATA
  ✅  generateMetadata() hər dinamik səhifədə
  ✅  Open Graph — Facebook/WhatsApp paylaşım
  ✅  Twitter Card — Twitter paylaşım
  ✅  robots meta — admin/cart/checkout noindex

ŞƏKİL
  ✅  next/image — WebP/AVIF avtomatik konversiya
  ✅  Lazy loading + blur placeholder
  ✅  alt atributu bütün şəkillərdə
  ✅  Cloudinary CDN — sürətli çatdırılma

PERFORMANS (Core Web Vitals)
  ✅  Lighthouse score hədəfi: 95+
  ✅  ISR ilə statik kəşleme
  ✅  Font optimization (next/font)
  ✅  Code splitting (React.lazy)

SİTEMAP
  ✅  next-sitemap ilə avtomatik sitemap.xml
  ✅  Dinamik məhsul/kateqoriya URL-ləri
  ✅  robots.txt avtomatik generasiya
```

---

## Hosting Seçimi (Pulsuz Tier)

| Xidmət | Məqsəd | Pulsuz Limit | Niyə seçildi |
|---|---|---|---|
| **Vercel** | Frontend (Next.js) | Limitsiz deploy | Next.js-in rəsmi partneri, edge network, ISR dəstəyi |
| **Render** | Backend API | 750 saat/ay | Auto-deploy, pulsuz SSL, sadə qurulum |
| **Supabase** | PostgreSQL | 500MB, limitsiz müddət | Render-dən üstün — silinmir, GUI daxili |
| **Cloudinary** | Şəkil/media | 25GB, 25k transform | CDN daxili, e-commerce üçün kifayət |
| **Stripe (test)** | Ödəniş | Limitsiz test | Sənaye standartı |
| **Resend** | Email | 3000 email/ay | Müasir API, yüksək deliverability |

> 💡 **Tövsiyə:** Verilənlər bazası üçün **Supabase** seçildi, çünki Render-in pulsuz
> PostgreSQL-i 90 gündən sonra silinir. Supabase pulsuz planda limitsiz müddət verir.

---

## Rəng Palitası

```css
--color-primary:       #0F172A;   /* Tünd lacivert — əsas rəng */
--color-primary-dark:  #020617;   /* Çox tünd */
--color-accent:        #F97316;   /* Narıncı — CTA düymələri, qiymət */
--color-accent-dark:   #EA580C;   /* Hover narıncı */
--color-white:         #FFFFFF;
--color-black:         #0A0A0A;
--color-gray-50:       #F8FAFC;
--color-gray-100:      #F1F5F9;
--color-gray-200:      #E2E8F0;
--color-gray-700:      #334155;
--color-gray-900:      #0F172A;
--color-success:       #22C55E;   /* Uğurlu sifariş, stokda var */
--color-warning:       #EAB308;   /* Az stok xəbərdarlığı */
--color-error:         #EF4444;   /* Xəta, stokda yoxdur */
```

---

## Rolllar

| Rol | Səlahiyyətlər |
|---|---|
| **Admin** | Tam idarəetmə: istifadəçilər, məhsullar, sifarişlər, vendorlar, kuponlar, statistika, kateqoriyalar, rəylər |
| **Vendor** | Öz mağazasını, məhsullarını, sifarişlərini idarə edir |
| **Customer** | Məhsul axtar, səbət, sifariş, ödəniş, rəy, istək siyahısı |

---

## Dil Dəstəyi (SEO-friendly)

- **AZ** — Azərbaycan dili (default) → `shopflow.az/az/...`
- **EN** — İngilis dili → `shopflow.az/en/...`
- **RU** — Rus dili → `shopflow.az/ru/...`

Hər dilin öz `sitemap.xml`-i ayrıca generasiya olunur.
`hreflang` tag-ları bütün səhifələrdə avtomatik əlavə edilir.

---

## Layout Strukturu

### Desktop — Admin/Vendor Panel
```
┌──────────────────────────────────────────────────────┐
│  SIDEBAR (240px)        │  MAIN AREA                 │
│  [Logo]                 │  [Header: Breadcrumb+User] │
│  [Dashboard]            │──────────────────────────  │
│  [Məhsullar]            │                            │
│  [Sifarişlər]           │  Content                   │
│  [Müştərilər]           │                            │
│  [Statistika]           │                            │
│  [Parametrlər]          │                            │
└─────────────────────────┴────────────────────────────┘
```

### Desktop — Public Mağaza
```
┌──────────────────────────────────────────────────────┐
│  TOP NAVBAR                                          │
│  [Logo] [Kateqoriyalar▼] [🔍 Axtar...] [❤️][🛒][👤] │
├──────────────────────────────────────────────────────┤
│  [Breadcrumb: Ana > Elektronika > Telefonlar]        │
├──────────────────────────────────────────────────────┤
│  FILTER SIDEBAR (260px)  │  MƏHSUL GRİD             │
│  [Kateqoriya]            │  [Kart][Kart][Kart]       │
│  [Qiymət aralığı]        │  [Kart][Kart][Kart]       │
│  [Brend]                 │  [Pagination]             │
│  [Reytinq]               │                           │
└──────────────────────────┴───────────────────────────┘
│  FOOTER                                              │
│  [Haqqımızda][Əlaqə][Qaydalar][Social Media]        │
└──────────────────────────────────────────────────────┘
```

### Mobil — Public Mağaza
```
┌─────────────────┐
│   TOP NAVBAR    │
│ [Logo]  [🔍][🛒]│
├─────────────────┤
│   MƏZMUN        │
│  (2 sütun grid) │
│                 │
├─────────────────┤
│  BOTTOM TABS    │
│ [🏠][🔍][❤️][👤]│
└─────────────────┘
```

---

## Səhifələr

### Public (Customer)

| Səhifə | Yol | Rendering |
|---|---|---|
| Ana Səhifə | `/` | SSG + ISR (1 saat) |
| Məhsul Siyahısı | `/products` | SSR |
| Məhsul Detalı | `/products/[slug]` | SSG + ISR (30 dəq) |
| Kateqoriya | `/category/[slug]` | SSG + ISR (1 saat) |
| Axtarış | `/search?q=...` | SSR |
| Səbət | `/cart` | CSR |
| Checkout | `/checkout` | CSR |
| Sifariş Təsdiqi | `/order/success/[id]` | SSR |
| Sifarişlərim | `/orders` | SSR |
| Sifariş Detalı | `/orders/[id]` | SSR |
| İstək Siyahısı | `/wishlist` | CSR |
| Profil | `/profile` | CSR |
| Ünvanlarım | `/profile/addresses` | CSR |
| Login | `/login` | CSR |
| Register | `/register` | CSR |
| Şifrə Sıfırla | `/reset-password` | CSR |

### Admin Panel

| Səhifə | Yol | Təsvir |
|---|---|---|
| Dashboard | `/admin` | KPI kartlar, son sifarişlər, satış qrafiki |
| Məhsullar | `/admin/products` | CRUD, bulk əməliyyat, şəkil yükləmə |
| Kateqoriyalar | `/admin/categories` | Ağac strukturu |
| Sifarişlər | `/admin/orders` | Siyahı, filter, status dəyişikliyi |
| Müştərilər | `/admin/customers` | Siyahı, blok/aktiv et |
| Vendorlar | `/admin/vendors` | Siyahı, təsdiq/rədd |
| Kuponlar | `/admin/coupons` | Yarat, düzəlt, sil |
| Rəylər | `/admin/reviews` | Moderasiya |
| Analitika | `/admin/analytics` | Satış, konversiya qrafiklər |
| Parametrlər | `/admin/settings` | Sayt adı, valyuta, email şablonları |

### Vendor Panel

| Səhifə | Yol | Təsvir |
|---|---|---|
| Dashboard | `/vendor` | Öz satış statistikası |
| Məhsullar | `/vendor/products` | Öz məhsullarını idarə et |
| Sifarişlər | `/vendor/orders` | Öz sifarişləri |
| Mağaza Profili | `/vendor/store` | Ad, logo, açıqlama |

---

## Sənədlər İndeksi

```
docs/
├── README.md                  ← Bu fayl — ümumi baxış
├── TODO.md                    ← Tapşırıqlar siyahısı (mərhələlər)
├── ARCHITECTURE.md            ← Texniki arxitektura, data flow
├── API.md                     ← Bütün REST endpointlər
├── AUTH.md                    ← JWT, refresh token, Google OAuth
├── SECURITY.md                ← Helmet, CORS, rate limit, validation
├── ERROR_HANDLING.md          ← Xəta idarəsi, AppError, global handler
├── TESTING.md                 ← Jest, Supertest, React Testing Library
├── ROLES_PERMISSIONS.md       ← Rol matrisi, RBAC
├── COMPONENTS.md              ← Komponent kataloqu, props
├── I18N.md                    ← next-intl, AZ/EN/RU, SEO hreflang
├── DEPLOYMENT.md              ← Vercel, Render, Supabase, CI/CD
├── DATABASE.md                ← PostgreSQL schema, Prisma, migration
├── PAYMENT.md                 ← Stripe inteqrasiyası, webhook
├── MEDIA.md                   ← Cloudinary, şəkil optimallaşması
├── SEO.md                     ← SEO strategiyası, metadata, sitemap
└── CONTRIBUTING.md            ← Töhfə qaydaları, commit formatı
```

---

## Layihə Strukturu

```
shopflow/
│
├── client/                              ← Frontend (Next.js 14 + TypeScript)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt                   ← next-sitemap tərəfindən yaradılır
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/                ← next-intl (az | en | ru)
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── register/page.tsx
│   │   │   │   │
│   │   │   │   ├── (shop)/              ← Public mağaza
│   │   │   │   │   ├── layout.tsx       ← Navbar + Footer
│   │   │   │   │   ├── page.tsx         ← Ana səhifə (SSG+ISR)
│   │   │   │   │   ├── products/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   ├── category/[slug]/page.tsx
│   │   │   │   │   ├── search/page.tsx
│   │   │   │   │   ├── cart/page.tsx
│   │   │   │   │   ├── checkout/page.tsx
│   │   │   │   │   ├── orders/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   ├── wishlist/page.tsx
│   │   │   │   │   └── profile/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── addresses/page.tsx
│   │   │   │   │
│   │   │   │   ├── admin/               ← Admin panel
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── products/
│   │   │   │   │   ├── categories/
│   │   │   │   │   ├── orders/
│   │   │   │   │   ├── customers/
│   │   │   │   │   ├── vendors/
│   │   │   │   │   ├── coupons/
│   │   │   │   │   ├── reviews/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   └── settings/
│   │   │   │   │
│   │   │   │   └── vendor/              ← Vendor panel
│   │   │   │       ├── layout.tsx
│   │   │   │       ├── page.tsx
│   │   │   │       ├── products/
│   │   │   │       ├── orders/
│   │   │   │       └── store/
│   │   │   │
│   │   │   ├── api/                     ← Next.js Route Handlers
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   └── webhooks/stripe/route.ts
│   │   │   │
│   │   │   └── layout.tsx               ← Root layout
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   └── ConfirmDialog.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   ├── VendorSidebar.tsx
│   │   │   │   ├── BottomTabs.tsx
│   │   │   │   └── Breadcrumb.tsx       ← SEO breadcrumb + JSON-LD
│   │   │   │
│   │   │   ├── shop/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── ProductFilters.tsx
│   │   │   │   ├── ProductImages.tsx
│   │   │   │   ├── ProductSchema.tsx    ← JSON-LD Schema.org
│   │   │   │   ├── CartItem.tsx
│   │   │   │   ├── CartSummary.tsx
│   │   │   │   ├── CheckoutForm.tsx
│   │   │   │   ├── StripePayment.tsx
│   │   │   │   ├── ReviewCard.tsx
│   │   │   │   ├── ReviewForm.tsx
│   │   │   │   └── StarRating.tsx
│   │   │   │
│   │   │   └── ui/
│   │   │       ├── StatCard.tsx
│   │   │       ├── DataTable.tsx
│   │   │       ├── PageHeader.tsx
│   │   │       ├── SearchBar.tsx
│   │   │       ├── PriceRange.tsx
│   │   │       └── LanguageSwitcher.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useWishlist.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useRole.ts
│   │   │
│   │   ├── store/                       ← Zustand
│   │   │   ├── authStore.ts
│   │   │   ├── cartStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                   ← Axios instance + interceptors
│   │   │   ├── queryClient.ts           ← TanStack Query konfiqurasiyası
│   │   │   ├── stripe.ts
│   │   │   └── utils.ts                 ← cn(), formatPrice() və s.
│   │   │
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── product.types.ts
│   │   │   ├── order.types.ts
│   │   │   ├── cart.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── vendor.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── formatPrice.ts
│   │   │   ├── formatDate.ts
│   │   │   ├── seoHelpers.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── i18n/
│   │       ├── request.ts
│   │       ├── az.json
│   │       ├── en.json
│   │       └── ru.json
│   │
│   ├── .env.example
│   ├── next.config.ts
│   ├── next-sitemap.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                              ← Backend (Express + TypeScript)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                    ← Prisma Client
│   │   │   ├── corsOptions.ts
│   │   │   ├── cloudinary.ts
│   │   │   ├── stripe.ts
│   │   │   └── logger.ts                ← Winston
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── productController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── cartController.ts
│   │   │   ├── reviewController.ts
│   │   │   ├── couponController.ts
│   │   │   ├── vendorController.ts
│   │   │   ├── wishlistController.ts
│   │   │   ├── addressController.ts
│   │   │   ├── paymentController.ts
│   │   │   └── analyticsController.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── roleMiddleware.ts
│   │   │   ├── errorMiddleware.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validate.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   ├── cartRoutes.ts
│   │   │   ├── reviewRoutes.ts
│   │   │   ├── couponRoutes.ts
│   │   │   ├── vendorRoutes.ts
│   │   │   ├── wishlistRoutes.ts
│   │   │   ├── addressRoutes.ts
│   │   │   ├── paymentRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── sendEmail.ts
│   │   │   ├── generateToken.ts
│   │   │   ├── apiResponse.ts
│   │   │   ├── asyncHandler.ts
│   │   │   ├── AppError.ts
│   │   │   └── slugify.ts
│   │   │
│   │   ├── types/
│   │   │   ├── express.d.ts             ← req.user tipini genişləndir
│   │   │   └── index.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                              ← Paylaşılan Zod schema-lar
│   └── schemas/
│       ├── auth.schema.ts
│       ├── product.schema.ts
│       ├── order.schema.ts
│       └── user.schema.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── README.md
```

---

## Mühit Dəyişənləri

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development

# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_64_chars
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret_min_64_chars
JWT_REFRESH_EXPIRE=30d

# Resend (Email)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@shopflow.az

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Client URL (CORS)
CLIENT_URL=http://localhost:3000
```

---

## Sürətli Başlanğıc

```bash
# Repo-nu klonla
git clone https://github.com/your-username/shopflow.git
cd shopflow

# ── Backend ──────────────────────────────────────────
cd server
npm install
cp .env.example .env
# .env faylını doldur

npx prisma migrate dev --name init   # Cədvəlləri yarat
npx prisma db seed                   # Test data doldur
npm run dev                          # localhost:5000

# ── Frontend (yeni terminal) ─────────────────────────
cd ../client
npm install
cp .env.example .env.local
# .env.local faylını doldur

npm run dev                          # localhost:3000

# ── Prisma Studio (vizual DB idarəsi) ────────────────
cd server && npx prisma studio       # localhost:5555

# ── Test ─────────────────────────────────────────────
cd server && npm run test
cd client && npm run test

# ── Production Build ──────────────────────────────────
cd client && npm run build
cd server && npm run build && npm start
```

---

## Əlaqə

Layihə ilə bağlı suallar: **admin@shopflow.az**
