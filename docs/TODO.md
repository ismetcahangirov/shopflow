# TODO.md — ShopFlow E-Commerce Platform

> Local AI ilə işləyərkən tamamlanan tapşırıqları `[ ]` → `[x]` et.  
> **Format:** `[x]` = tamamlandı · `[ ]` = gözləyir · `[~]` = davam edir · `[!]` = bloklanıb

---

## Git İş Axını (Hər tapşırıq üçün)

```
1.  TODO.md-dəki ilk [ ] tapşırığı tap
2.  git checkout main
3.  git pull origin main
4.  git checkout -b feature/<branch-adı>
5.  Tapşırığı yerinə yetir
6.  Bu TODO.md-də [ ] → [x] et
7.  git add . && git commit -m "<növ>(<əhatə>): <açıqlama>"
8.  git push origin feature/<branch-adı>
9.  Sahibə xəbər ver: branch adı + tamamlanan tapşırıqlar
10. SAHİBİN PR açmasını və birləşdirməsini GÖZLƏ
11. Sahib "davam et" dedikdə → ADDIM 2-yə qayıt
```

> ⚠️ PR birləşməmiş növbəti tapşırığa BAŞLAMA  
> ⚠️ Heç vaxt birbaşa main-ə push ETMƏ  
> 📄 Ətraflı qaydalar: `WORKFLOW.md`

---

## Mərhələ 0 — Sənədləşmə
**Branch:** `docs/m00-documentation`  
**Status:** `[x]` Tamamlandı

- [x] `README.md` hazırlandı
- [x] `ARCHITECTURE.md` hazırlandı
- [x] `DATABASE.md` hazırlandı
- [x] `API.md` hazırlandı
- [x] `AUTH.md` hazırlandı
- [x] `SECURITY.md` hazırlandı
- [x] `ERROR_HANDLING.md` hazırlandı
- [x] `TESTING.md` hazırlandı
- [x] `ROLES_PERMISSIONS.md` hazırlandı
- [x] `COMPONENTS.md` hazırlandı
- [x] `I18N.md` hazırlandı
- [x] `DEPLOYMENT.md` hazırlandı
- [x] `PAYMENT.md` hazırlandı
- [x] `MEDIA.md` hazırlandı
- [x] `SEO.md` hazırlandı
- [x] `CONTRIBUTING.md` hazırlandı
- [x] `TODO.md` hazırlandı
- [x] `WORKFLOW.md` hazırlandı
- [x] `rules.md` hazırlandı

---

## Mərhələ 1 — Layihə Qurulumu

### 1.1 Backend (Server)
**Branch:** `chore/m01-backend-setup`

- [ ] Node.js + Express + TypeScript layihəsi yaradıldı
- [ ] `tsconfig.json` konfiqurasiya edildi
- [ ] `package.json` scripts (dev, build, start, test, lint)
- [ ] `src/server.ts` entry point yazıldı
- [ ] PostgreSQL bağlantısı quruldu (`src/config/db.ts` — Prisma Client)
- [ ] Prisma quraşdırıldı (`npm install prisma @prisma/client`)
- [ ] `prisma/schema.prisma` bütün modellər yazıldı
- [ ] İlk migration icra edildi (`npx prisma migrate dev --name init`)
- [ ] Seed data hazırlandı (`prisma/seed.ts`)
- [ ] Seed icra edildi (`npx prisma db seed`)
- [ ] Helmet quraşdırıldı və konfiqurasiya edildi
- [ ] CORS konfiqurasiya edildi (`src/config/corsOptions.ts`)
- [ ] Morgan (HTTP logging) quraşdırıldı
- [ ] Winston (structured logging) quraşdırıldı (`src/config/logger.ts`)
- [ ] dotenv konfiqurasiya edildi
- [ ] Rate limiter yazıldı (`src/middleware/rateLimiter.ts`)
- [ ] Global error handler yazıldı (`src/middleware/errorMiddleware.ts`)
- [ ] `AppError` sinifi yazıldı (`src/utils/AppError.ts`)
- [ ] `asyncHandler` yazıldı (`src/utils/asyncHandler.ts`)
- [ ] `apiResponse` utility yazıldı (`src/utils/apiResponse.ts`)
- [ ] `slugify` utility yazıldı (`src/utils/slugify.ts`)
- [ ] Health check endpoint yazıldı (`GET /api/health`)
- [ ] `express.d.ts` — `req.user` tipi genişləndirildi

### 1.2 Frontend (Client)
**Branch:** `chore/m01-frontend-setup`

- [ ] Next.js 14 + TypeScript layihəsi yaradıldı (`npx create-next-app@latest`)
- [ ] App Router konfigurasiya edildi
- [ ] Tailwind CSS konfiqurasiya edildi (`tailwind.config.ts`)
- [ ] Shadcn/ui quraşdırıldı (`npx shadcn@latest init`)
- [ ] Lucide React quraşdırıldı
- [ ] Zustand quraşdırıldı
- [ ] TanStack Query v5 quraşdırıldı
- [ ] React Hook Form quraşdırıldı
- [ ] Zod quraşdırıldı
- [ ] Axios instance yaradıldı (`src/lib/api.ts` — base URL, interceptors)
- [ ] TanStack Query client yaradıldı (`src/lib/queryClient.ts`)
- [ ] next-intl quraşdırıldı
- [ ] `middleware.ts` yazıldı (i18n + route qoruması)
- [ ] `src/i18n/request.ts` yazıldı
- [ ] `az.json`, `en.json`, `ru.json` yaradıldı (tam açarlar)
- [ ] `next.config.ts` konfigurasiya edildi (next-intl plugin)
- [ ] Tailwind rəng palitası konfiqurasiya edildi (primary, accent, semantic rənglər)
- [ ] Global CSS dəyişənləri yaradıldı
- [ ] `cn()` utility (clsx + tailwind-merge)
- [ ] Qovluq strukturu yaradıldı (`app/`, `components/`, `store/`, `hooks/`, `types/`, `utils/`, `lib/`, `i18n/`)
- [ ] TypeScript tipləri yaradıldı (`src/types/`)
- [ ] `shared/schemas/` — Zod schema-ları yaradıldı

---

## Mərhələ 2 — Autentifikasiya

### 2.1 Backend — Auth
**Branch:** `feature/m02-auth-backend`

- [ ] `User` modeli Prisma-da hazırdır (Mərhələ 1-də)
- [ ] Şifrə hashlanması tətbiq edildi (bcryptjs, salt: 12)
- [ ] JWT token generasiyası yazıldı (`src/utils/generateToken.ts`)
- [ ] `POST /api/auth/register` endpointi hazırlandı
- [ ] `POST /api/auth/login` endpointi hazırlandı
- [ ] `POST /api/auth/logout` endpointi hazırlandı
- [ ] `POST /api/auth/refresh-token` endpointi hazırlandı
- [ ] `POST /api/auth/google` — Google OAuth endpointi hazırlandı (`google-auth-library`)
- [ ] `POST /api/auth/forgot-password` endpointi hazırlandı
- [ ] `POST /api/auth/reset-password/:token` endpointi hazırlandı
- [ ] `GET /api/auth/verify-email/:token` endpointi hazırlandı
- [ ] Auth middleware yazıldı (`src/middleware/authMiddleware.ts`)
- [ ] Rol middleware yazıldı (`src/middleware/roleMiddleware.ts`)
- [ ] Resend quraşdırıldı (`npm install resend`)
- [ ] Email göndərmə utility yazıldı (`src/utils/sendEmail.ts`)
- [ ] Refresh token httpOnly cookie ilə idarə edilir
- [ ] Rate limiting auth endpointlərə tətbiq edildi
- [ ] Auth validasiyaları tətbiq edildi (express-validator)

### 2.2 Frontend — Auth
**Branch:** `feature/m02-auth-frontend`

- [ ] Zustand `authStore` yaradıldı (`src/store/authStore.ts`)
- [ ] Login səhifəsi yaradıldı (`app/[locale]/(auth)/login/page.tsx`)
- [ ] Register səhifəsi yaradıldı (`app/[locale]/(auth)/register/page.tsx`)
- [ ] Şifrəni unutdum səhifəsi yaradıldı
- [ ] Şifrə sıfırlama səhifəsi yaradıldı
- [ ] Email doğrulama səhifəsi yaradıldı
- [ ] Google OAuth düyməsi əlavə edildi (`@react-oauth/google`)
- [ ] Google OAuth inteqrasiyası tamamlandı
- [ ] Forma validasiyası (React Hook Form + Zod) tətbiq edildi
- [ ] Token saxlama strategiyası (Zustand memory + httpOnly cookie)
- [ ] Axios interceptor ilə auto token refresh tətbiq edildi
- [ ] `ProtectedRoute` komponenti yaradıldı
- [ ] Auth layout yaradıldı
- [ ] `useRole` hook yazıldı

---

## Mərhələ 3 — Layout & Naviqasiya
**Branch:** `feature/m03-layout`

- [ ] Root layout yaradıldı (`app/layout.tsx` — font, providers)
- [ ] Shop layout yaradıldı (`app/[locale]/(shop)/layout.tsx`)
- [ ] Admin layout yaradıldı (`app/[locale]/admin/layout.tsx`)
- [ ] Vendor layout yaradıldı (`app/[locale]/vendor/layout.tsx`)
- [ ] `Navbar` komponenti yaradıldı (logo, axtarış, səbət sayğacı, profil dropdown)
- [ ] `Footer` komponenti yaradıldı
- [ ] `AdminSidebar` komponenti yaradıldı
- [ ] `VendorSidebar` komponenti yaradıldı
- [ ] `BottomTabs` komponenti yaradıldı (mobil)
- [ ] `Breadcrumb` komponenti yaradıldı (JSON-LD daxil)
- [ ] `navItems.ts` — rola görə naviqasiya elementləri
- [ ] Sidebar açma/bağlama funksionallığı (`uiStore`)
- [ ] Aktiv naviqasiya elementi vurğulandı (`usePathname`)
- [ ] `LanguageSwitcher` komponenti yaradıldı
- [ ] Responsive breakpoint-lər tənzimləndi
- [ ] `next/font` konfiqurasiya edildi (FOUT yoxdur)

---

## Mərhələ 4 — Common Komponentlər
**Branch:** `feature/m04-common-components`

- [ ] `Button.tsx` yaradıldı (5 variant, isLoading, icon dəstəyi)
- [ ] `Input.tsx` yaradıldı (label, error, hint, icon, forwardRef)
- [ ] `Modal.tsx` yaradıldı (size, footer, closeOnBackdrop)
- [ ] `Badge.tsx` yaradıldı (5 variant, dot)
- [ ] `Avatar.tsx` yaradıldı (ölçü, fallback)
- [ ] `Spinner.tsx` yaradıldı
- [ ] `Skeleton.tsx` yaradıldı (ProductCardSkeleton, ProductGridSkeleton)
- [ ] `EmptyState.tsx` yaradıldı (icon, title, description, action)
- [ ] `ErrorState.tsx` yaradıldı (message, onRetry)
- [ ] `ErrorBoundary.tsx` yaradıldı
- [ ] `Pagination.tsx` yaradıldı (showInfo daxil)
- [ ] `ConfirmDialog.tsx` yaradıldı
- [ ] `Table.tsx` yaradıldı
- [ ] `DataTable.tsx` yaradıldı (sortable, selectable, actions, skeleton)
- [ ] `StatCard.tsx` yaradıldı (dəyişim %, rəng)
- [ ] `PageHeader.tsx` yaradıldı
- [ ] `SearchBar.tsx` yaradıldı (debounce 300ms)
- [ ] `PriceRange.tsx` yaradıldı (ikili slider)

---

## Mərhələ 5 — Kateqoriyalar

### 5.1 Backend
**Branch:** `feature/m05-categories-backend`

- [ ] `GET /api/categories` — ağac strukturu ilə
- [ ] `GET /api/categories/:slug` — tək kateqoriya
- [ ] `POST /api/categories` — yarat (Admin)
- [ ] `PUT /api/categories/:id` — yenilə (Admin)
- [ ] `DELETE /api/categories/:id` — sil (Admin, məhsul yoxsa)
- [ ] Kateqoriya şəkli yükləmə (Cloudinary)

### 5.2 Frontend
**Branch:** `feature/m05-categories-frontend`

- [ ] Kateqoriya siyahısı (navbar dropdown)
- [ ] Kateqoriya səhifəsi yaradıldı (`/category/[slug]/page.tsx`)
- [ ] `generateMetadata()` kateqoriya üçün
- [ ] `generateStaticParams()` kateqoriyalar üçün
- [ ] Admin: kateqoriya CRUD səhifəsi yaradıldı

---

## Mərhələ 6 — Məhsullar

### 6.1 Backend
**Branch:** `feature/m06-products-backend`

- [ ] `GET /api/products` — siyahı (filter, sort, pagination, axtarış)
- [ ] `GET /api/products/:slug` — tək məhsul
- [ ] `GET /api/products/featured` — öne çıxanlar
- [ ] `GET /api/products/search` — autocomplete
- [ ] `POST /api/products` — yarat (Admin/Vendor, şəkil yükləmə)
- [ ] `PUT /api/products/:id` — yenilə (Admin/Vendor — öz məhsulu)
- [ ] `DELETE /api/products/:id` — sil
- [ ] `POST /api/products/:id/images` — şəkil əlavə et
- [ ] `DELETE /api/products/:id/images/:imageId` — şəkil sil
- [ ] Cloudinary inteqrasiyası (uploadMultipleImages)
- [ ] Multer middleware (productImageUpload)
- [ ] Validasiya (express-validator)

### 6.2 Frontend
**Branch:** `feature/m06-products-frontend`

- [ ] `ProductCard.tsx` yaradıldı (endirim %, stok overlay, hover)
- [ ] `ProductGrid.tsx` yaradıldı (responsive grid)
- [ ] `ProductFilters.tsx` yaradıldı (URL sync)
- [ ] `ProductImages.tsx` yaradıldı (galereya, zoom, swipe)
- [ ] `ProductSchema.tsx` yaradıldı (JSON-LD)
- [ ] `StarRating.tsx` yaradıldı (display + interactive)
- [ ] Məhsul siyahısı səhifəsi (`/products/page.tsx` — SSR)
- [ ] Məhsul detalı səhifəsi (`/products/[slug]/page.tsx` — SSG+ISR)
- [ ] Axtarış səhifəsi (`/search/page.tsx` — SSR)
- [ ] `generateMetadata()` məhsul detalı üçün
- [ ] `generateStaticParams()` populyar məhsullar üçün
- [ ] Admin: məhsul siyahısı + CRUD panel
- [ ] Vendor: məhsullarım səhifəsi

---

## Mərhələ 7 — Səbət

### 7.1 Backend
**Branch:** `feature/m07-cart-backend`

- [ ] `GET /api/cart` — səbəti al
- [ ] `POST /api/cart/items` — məhsul əlavə et
- [ ] `PATCH /api/cart/items/:productId` — miqdar dəyiş
- [ ] `DELETE /api/cart/items/:productId` — məhsul çıxar
- [ ] `DELETE /api/cart` — səbəti təmizlə

### 7.2 Frontend
**Branch:** `feature/m07-cart-frontend`

- [ ] Zustand `cartStore` yaradıldı (persist — localStorage)
- [ ] `CartItem.tsx` yaradıldı (+ / - miqdar, sil)
- [ ] `CartSummary.tsx` yaradıldı (ara cəm, çatdırılma, ümumi)
- [ ] Səbət səhifəsi yaradıldı (`/cart/page.tsx` — CSR)
- [ ] Navbar-da səbət sayğacı (real-time)
- [ ] Boş səbət vəziyyəti
- [ ] Pulsuz çatdırılma progress barı

---

## Mərhələ 8 — Kuponlar

### 8.1 Backend
**Branch:** `feature/m08-coupons-backend`

- [ ] `GET /api/coupons` — siyahı (Admin)
- [ ] `POST /api/coupons` — yarat (Admin)
- [ ] `PUT /api/coupons/:id` — yenilə (Admin)
- [ ] `DELETE /api/coupons/:id` — sil (Admin)
- [ ] `POST /api/coupons/validate` — kupon yoxla (Customer)

### 8.2 Frontend
**Branch:** `feature/m08-coupons-frontend`

- [ ] `CouponInput.tsx` yaradıldı (3 vəziyyət: boş, uğurlu, xəta)
- [ ] Kupon CartSummary-ə inteqrasiya edildi
- [ ] Admin: Kuponlar CRUD səhifəsi

---

## Mərhələ 9 — Ünvanlar

### 9.1 Backend
**Branch:** `feature/m09-addresses-backend`

- [ ] `GET /api/addresses` — öz ünvanları
- [ ] `POST /api/addresses` — ünvan əlavə et
- [ ] `PUT /api/addresses/:id` — yenilə
- [ ] `DELETE /api/addresses/:id` — sil
- [ ] `PATCH /api/addresses/:id/default` — default et

### 9.2 Frontend
**Branch:** `feature/m09-addresses-frontend`

- [ ] Ünvanlar səhifəsi yaradıldı (`/profile/addresses`)
- [ ] Ünvan əlavə etmə forması
- [ ] Default ünvan seçimi

---

## Mərhələ 10 — Ödəniş & Sifariş

### 10.1 Backend
**Branch:** `feature/m10-payment-orders-backend`

- [ ] Stripe quraşdırıldı (`npm install stripe`)
- [ ] `src/config/stripe.ts` yazıldı
- [ ] `POST /api/payments/create-intent` — PaymentIntent yarat
- [ ] `POST /api/payments/webhook` — Stripe webhook (RAW body)
- [ ] `POST /api/payments/refund` — geri ödəniş (Admin)
- [ ] `handlePaymentSuccess` — Prisma transaction
- [ ] `handlePaymentFailure` — status yenilə
- [ ] `handleRefund` — geri ödəniş emal
- [ ] `POST /api/orders` — sifariş yarat (Customer)
- [ ] `GET /api/orders` — bütün sifarişlər (Admin)
- [ ] `GET /api/orders/my` — öz sifarişləri (Customer)
- [ ] `GET /api/orders/:id` — tək sifariş (Admin/sahib)
- [ ] `PATCH /api/orders/:id/status` — status dəyiş (Admin)
- [ ] `POST /api/orders/:id/cancel` — ləğv et
- [ ] Sifariş təsdiq emaili (Resend)
- [ ] `generateOrderNumber` utility
- [ ] Webhook route-u express.json()-dan əvvəl qeyd edildi

### 10.2 Frontend
**Branch:** `feature/m10-payment-orders-frontend`

- [ ] `@stripe/stripe-js` + `@stripe/react-stripe-js` quraşdırıldı
- [ ] `src/lib/stripe.ts` yazıldı (singleton)
- [ ] `CheckoutForm.tsx` yaradıldı (ünvan seçimi, kupon)
- [ ] `StripePayment.tsx` yaradıldı (PaymentElement)
- [ ] Checkout səhifəsi yaradıldı (`/checkout/page.tsx` — CSR)
- [ ] Sifariş uğur səhifəsi yaradıldı (`/order/success/[id]/page.tsx`)
- [ ] Sifarişlər siyahısı (`/orders/page.tsx`)
- [ ] Sifariş detalı (`/orders/[id]/page.tsx`)
- [ ] Admin: Sifarişlər paneli (filter, status dəyişmə)
- [ ] Stripe Webhook Stripe Dashboard-da konfiqurasiya edildi

---

## Mərhələ 11 — İstək Siyahısı

### 11.1 Backend
**Branch:** `feature/m11-wishlist-backend`

- [ ] `GET /api/wishlist` — öz istək siyahısı
- [ ] `POST /api/wishlist` — məhsul əlavə et
- [ ] `DELETE /api/wishlist/:productId` — çıxar

### 11.2 Frontend
**Branch:** `feature/m11-wishlist-frontend`

- [ ] İstək siyahısı səhifəsi (`/wishlist/page.tsx`)
- [ ] Məhsul kartında ❤️ düyməsi
- [ ] Navbar-da istək siyahısı sayğacı
- [ ] Zustand wishlistStore (opsional — API ilə sinxron)
- [ ] BottomTabs-da ❤️ tab

---

## Mərhələ 12 — Rəylər

### 12.1 Backend
**Branch:** `feature/m12-reviews-backend`

- [ ] `GET /api/reviews` — məhsul rəyləri (filter + pagination)
- [ ] `POST /api/reviews` — rəy yaz (alqı yoxlaması)
- [ ] `PATCH /api/reviews/:id/approve` — təsdiq (Admin)
- [ ] `DELETE /api/reviews/:id` — sil (Admin)
- [ ] Rəy yaradılanda məhsul `avgRating` + `reviewCount` yenilənir

### 12.2 Frontend
**Branch:** `feature/m12-reviews-frontend`

- [ ] `ReviewCard.tsx` yaradıldı
- [ ] `ReviewForm.tsx` yaradıldı (interaktiv ulduz)
- [ ] Məhsul detalında rəy bölməsi
- [ ] Admin: Rəylər moderasiya paneli

---

## Mərhələ 13 — Profil & Parametrlər

### 13.1 Backend
**Branch:** `feature/m13-profile-backend`

- [ ] `GET /api/users/me` — profil al
- [ ] `PUT /api/users/me` — profili yenilə
- [ ] `PUT /api/users/me/password` — şifrə dəyiş
- [ ] `POST /api/users/me/avatar` — avatar yüklə (Multer + Cloudinary)
- [ ] `GET /api/users` — bütün istifadəçilər (Admin)
- [ ] `PATCH /api/users/:id/status` — aktiv/deaktiv (Admin)

### 13.2 Frontend
**Branch:** `feature/m13-profile-frontend`

- [ ] Profil səhifəsi (`/profile/page.tsx`)
- [ ] Profil redaktə forması
- [ ] Avatar yükləmə (Cloudinary widget və ya birbaşa)
- [ ] Şifrə dəyiş forması
- [ ] Admin: İstifadəçilər paneli (filter, blok/aktiv)

---

## Mərhələ 14 — Vendor

### 14.1 Backend
**Branch:** `feature/m14-vendor-backend`

- [ ] `POST /api/vendors/apply` — vendor müraciəti
- [ ] `GET /api/vendors` — bütün vendorlar (Admin)
- [ ] `PATCH /api/vendors/:id/status` — təsdiq/rədd (Admin)
- [ ] `GET /api/vendors/me` — öz vendor profili
- [ ] `PUT /api/vendors/me` — vendor profilini yenilə
- [ ] `GET /api/vendors/me/stats` — vendor statistikaları
- [ ] `requireApprovedVendor` middleware yazıldı

### 14.2 Frontend
**Branch:** `feature/m14-vendor-frontend`

- [ ] Vendor müraciət forması
- [ ] Vendor Dashboard (`/vendor/page.tsx`)
- [ ] Vendor məhsulları (`/vendor/products/`)
- [ ] Vendor sifarişləri (`/vendor/orders/`)
- [ ] Vendor mağaza profili (`/vendor/store/`)
- [ ] Admin: Vendorlar paneli (təsdiq/rədd)

---

## Mərhələ 15 — Dashboard & Analitika

### 15.1 Backend
**Branch:** `feature/m15-analytics-backend`

- [ ] `GET /api/analytics/dashboard` — KPI statistika (Admin)
- [ ] `GET /api/analytics/sales` — satış qrafiki (Admin)
- [ ] `GET /api/settings` — sayt parametrləri (public)
- [ ] `PUT /api/settings` — parametrləri yenilə (Admin)
- [ ] Rola görə fərqli statistika (Admin vs Vendor)

### 15.2 Frontend
**Branch:** `feature/m15-analytics-frontend`

- [ ] Admin Dashboard (`/admin/page.tsx`) — StatCard-lar, satış qrafiki, son sifarişlər
- [ ] Vendor Dashboard (`/vendor/page.tsx`) — öz statistikası
- [ ] Customer Dashboard → ana səhifəyə yönləndirir
- [ ] Satış qrafiki (Recharts və ya Chart.js)
- [ ] Son sifarişlər cədvəli

---

## Mərhələ 16 — SEO & Performans

**Branch:** `feature/m16-seo-performance`

- [ ] `generateMetadata()` bütün public səhifələrdə
- [ ] `generateStaticParams()` məhsullar + kateqoriyalar üçün
- [ ] Product JSON-LD schema (`ProductSchema.tsx`)
- [ ] BreadcrumbList JSON-LD (`Breadcrumb.tsx`)
- [ ] Organization + WebSite schema (ana səhifə)
- [ ] `src/app/robots.ts` yazıldı
- [ ] `src/app/sitemap.ts` yazıldı (statik)
- [ ] `server-sitemap.xml/route.ts` yazıldı (dinamik)
- [ ] `next-sitemap` quraşdırıldı
- [ ] `next-sitemap.config.js` konfigurasiya edildi
- [ ] `postbuild` hook əlavə edildi
- [ ] hreflang bütün səhifələrdə (az/en/ru/x-default)
- [ ] Canonical URL hər səhifədə
- [ ] `next/image` `priority={true}` LCP şəkilləri üçün
- [ ] `sizes` prop bütün `next/image`-lərdə
- [ ] Blur placeholder (aspect-ratio container)
- [ ] Lighthouse Performance 90+ yoxlandı
- [ ] Lighthouse SEO 100 yoxlandı

---

## Mərhələ 17 — Testlər

### 17.1 Backend Testlər
**Branch:** `test/m17-backend-tests`

- [ ] Jest + Supertest + ts-jest quraşdırıldı
- [ ] `testHelpers.ts` yazıldı
- [ ] Test PostgreSQL DB yaradıldı
- [ ] `setup.ts` — beforeEach cədvəl təmizlənməsi
- [ ] `globalSetup.ts` — production DB qoruması
- [ ] Auth testlər yazıldı (register, login, google, refresh, logout)
- [ ] Məhsul testlər yazıldı (CRUD, filter, rol yoxlaması)
- [ ] Kateqoriya testlər yazıldı
- [ ] Sifariş testlər yazıldı (yarat, stok yoxlaması, ləğv et)
- [ ] Kupon testlər yazıldı
- [ ] Rəy testlər yazıldı (alqı yoxlaması, moderasiya)
- [ ] Ödəniş testlər yazıldı (PaymentIntent, webhook)
- [ ] Coverage 80%+ çatdı

### 17.2 Frontend Testlər
**Branch:** `test/m17-frontend-tests`

- [ ] Vitest + React Testing Library quraşdırıldı
- [ ] `vitest.config.ts` konfigurasiya edildi
- [ ] Test setup (next/navigation, next/image, next-intl mock-ları)
- [ ] `Button`, `Input`, `Badge`, `Modal` komponent testlər
- [ ] `StarRating`, `CartItem`, `ProductCard` testlər
- [ ] Zustand `cartStore` unit testlər
- [ ] `useRole` hook testi
- [ ] Coverage 80%+ çatdı

### 17.3 E2E Testlər
**Branch:** `test/m17-e2e-tests`

- [ ] Playwright quraşdırıldı
- [ ] `playwright.config.ts` konfigurasiya edildi
- [ ] Qeydiyyat → giriş → çıxış axını
- [ ] Axtarış → məhsul detalı → səbət axını
- [ ] Checkout axını (test kartı ilə)
- [ ] SEO meta tag + hreflang yoxlaması

---

## Mərhələ 18 — Təhlükəsizlik

**Branch:** `chore/m18-security`

- [ ] Helmet middleware konfigurasiya edildi (CSP, HSTS, Stripe + Google)
- [ ] CORS yalnız shopflow.az üçün açıqdır
- [ ] Rate limiting bütün auth endpointlərindədir
- [ ] Input sanitization (express-validator bütün route-larda)
- [ ] Prisma parametrized queries — SQL injection yoxdur
- [ ] Stripe webhook imzası yoxlanır
- [ ] JWT secret minimum 64 simvoldur
- [ ] Şifrə salt rounds 12-dir
- [ ] `.env` faylları `.gitignore`-dadır
- [ ] `npm audit --audit-level=high` keçib
- [ ] Next.js `middleware.ts` admin/vendor route-larını qoruyur
- [ ] `noindex` admin/vendor/checkout/cart səhifələrindədir

---

## Mərhələ 19 — Deploy & CI/CD

**Branch:** `chore/m19-deployment`

- [ ] Supabase PostgreSQL yaradıldı
- [ ] Cloudinary hesabı yaradıldı, upload preset konfigurasiya edildi
- [ ] Resend hesabı yaradıldı, domain doğrulandı
- [ ] Stripe production hesabı, webhook konfigurasiya edildi
- [ ] `render.yaml` yazıldı
- [ ] Render-də backend deploy edildi
- [ ] Custom domain `api.shopflow.az` Render-ə bağlandı
- [ ] `vercel.json` yazıldı
- [ ] Vercel-də frontend deploy edildi
- [ ] Custom domain `shopflow.az` Vercel-ə bağlandı
- [ ] `.github/workflows/ci.yml` yazıldı
- [ ] GitHub Secrets konfigurasiya edildi (6 secret)
- [ ] CI/CD pipeline test edildi (lint → test → security → build → deploy)
- [ ] `POST /api/health` → `{ status: "ok", db: "connected" }`
- [ ] HTTPS hər iki domain üçün aktiv
- [ ] Deploy sonrası yoxlama siyahısı keçildi

---

## Ümumi Tərəqqi

| Mərhələ | Status | Tamamlanma |
|---|---|---|
| 0 — Sənədləşmə | `[x]` tamamlandı | 100% |
| 1 — Qurulum | `[ ]` gözləyir | 0% |
| 2 — Auth | `[ ]` gözləyir | 0% |
| 3 — Layout | `[ ]` gözləyir | 0% |
| 4 — Komponentlər | `[ ]` gözləyir | 0% |
| 5 — Kateqoriyalar | `[ ]` gözləyir | 0% |
| 6 — Məhsullar | `[ ]` gözləyir | 0% |
| 7 — Səbət | `[ ]` gözləyir | 0% |
| 8 — Kuponlar | `[ ]` gözləyir | 0% |
| 9 — Ünvanlar | `[ ]` gözləyir | 0% |
| 10 — Ödəniş & Sifariş | `[ ]` gözləyir | 0% |
| 11 — İstək Siyahısı | `[ ]` gözləyir | 0% |
| 12 — Rəylər | `[ ]` gözləyir | 0% |
| 13 — Profil | `[ ]` gözləyir | 0% |
| 14 — Vendor | `[ ]` gözləyir | 0% |
| 15 — Analitika | `[ ]` gözləyir | 0% |
| 16 — SEO & Performans | `[ ]` gözləyir | 0% |
| 17 — Testlər | `[ ]` gözləyir | 0% |
| 18 — Təhlükəsizlik | `[ ]` gözləyir | 0% |
| 19 — Deploy | `[ ]` gözləyir | 0% |

---

> **Qeyd:** Hər tapşırığı tamamladıqdan sonra bu faylı yenilə.  
> Local AI ilə işləyərkən: "TODO.md-ə bax, hansı tapşırıq növbəti?" deyə soruşa bilərsən.
