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

- [x] Node.js + Express + TypeScript layihəsi yaradıldı
- [x] `tsconfig.json` konfiqurasiya edildi
- [x] `package.json` scripts (dev, build, start, test, lint)
- [x] `src/server.ts` entry point yazıldı
- [x] PostgreSQL bağlantısı quruldu (`src/config/db.ts` — Prisma Client)
- [x] Prisma quraşdırıldı (`npm install prisma @prisma/client`)
- [x] `prisma/schema.prisma` bütün modellər yazıldı
- [x] İlk migration icra edildi (`npx prisma migrate dev --name init`)
- [x] Seed data hazırlandı (`prisma/seed.ts`)
- [x] Seed icra edildi (`npx prisma db seed`)
- [x] Helmet quraşdırıldı və konfiqurasiya edildi
- [x] CORS konfiqurasiya edildi (`src/config/corsOptions.ts`)
- [x] Morgan (HTTP logging) quraşdırıldı
- [x] Winston (structured logging) quraşdırıldı (`src/config/logger.ts`)
- [x] dotenv konfiqurasiya edildi
- [x] Rate limiter yazıldı (`src/middleware/rateLimiter.ts`)
- [x] Global error handler yazıldı (`src/middleware/errorMiddleware.ts`)
- [x] `AppError` sinifi yazıldı (`src/utils/AppError.ts`)
- [x] `asyncHandler` yazıldı (`src/utils/asyncHandler.ts`)
- [x] `apiResponse` utility yazıldı (`src/utils/apiResponse.ts`)
- [x] `slugify` utility yazıldı (`src/utils/slugify.ts`)
- [x] Health check endpoint yazıldı (`GET /api/health`)
- [x] `express.d.ts` — `req.user` tipi genişləndirildi

### 1.2 Frontend (Client)
**Branch:** `chore/m01-frontend-setup`

- [x] Next.js 14 + TypeScript layihəsi yaradıldı (`npx create-next-app@latest`)
- [x] App Router konfigurasiya edildi
- [x] Tailwind CSS konfiqurasiya edildi (`tailwind.config.ts`)
- [x] Shadcn/ui quraşdırıldı (`npx shadcn@latest init`)
- [x] Lucide React quraşdırıldı
- [x] Zustand quraşdırıldı
- [x] TanStack Query v5 quraşdırıldı
- [x] React Hook Form quraşdırıldı
- [x] Zod quraşdırıldı
- [x] Axios instance yaradıldı (`src/lib/api.ts` — base URL, interceptors)
- [x] TanStack Query client yaradıldı (`src/lib/queryClient.ts`)
- [x] next-intl quraşdırıldı
- [x] `middleware.ts` yazıldı (i18n + route qoruması)
- [x] `src/i18n/request.ts` yazıldı
- [x] `az.json`, `en.json`, `ru.json` yaradıldı (tam açarlar)
- [x] `next.config.ts` konfigurasiya edildi (next-intl plugin)
- [x] Tailwind rəng palitası konfiqurasiya edildi (primary, accent, semantic rənglər)
- [x] Global CSS dəyişənləri yaradıldı
- [x] `cn()` utility (clsx + tailwind-merge)
- [x] Qovluq strukturu yaradıldı (`app/`, `components/`, `store/`, `hooks/`, `types/`, `utils/`, `lib/`, `i18n/`)
- [x] TypeScript tipləri yaradıldı (`src/types/`)
- [x] `shared/schemas/` — Zod schema-ları yaradıldı

---

## Mərhələ 2 — Autentifikasiya

### 2.1 Backend — Auth
**Branch:** `feature/m02-auth-backend`

- [x] `User` modeli Prisma-da hazırdır (Mərhələ 1-də)
- [x] Şifrə hashlanması tətbiq edildi (bcryptjs, salt: 12)
- [x] JWT token generasiyası yazıldı (`src/utils/generateToken.ts`)
- [x] `POST /api/auth/register` endpointi hazırlandı
- [x] `POST /api/auth/login` endpointi hazırlandı
- [x] `POST /api/auth/logout` endpointi hazırlandı
- [x] `POST /api/auth/refresh-token` endpointi hazırlandı
- [x] `POST /api/auth/google` — Google OAuth endpointi hazırlandı (`google-auth-library`)
- [x] `POST /api/auth/forgot-password` endpointi hazırlandı
- [x] `POST /api/auth/reset-password/:token` endpointi hazırlandı
- [x] `GET /api/auth/verify-email/:token` endpointi hazırlandı
- [x] Auth middleware yazıldı (`src/middleware/authMiddleware.ts`)
- [x] Rol middleware yazıldı (`src/middleware/roleMiddleware.ts`)
- [x] Resend quraşdırıldı (`npm install resend`)
- [x] Email göndərmə utility yazıldı (`src/utils/sendEmail.ts`)
- [x] Refresh token httpOnly cookie ilə idarə edilir
- [x] Rate limiting auth endpointlərə tətbiq edildi
- [x] Auth validasiyaları tətbiq edildi (express-validator)

### 2.2 Frontend — Auth
**Branch:** `feature/m02-auth-frontend`

- [x] Zustand `authStore` yaradıldı (`src/store/authStore.ts`)
- [x] Login səhifəsi yaradıldı (`app/[locale]/(auth)/login/page.tsx`)
- [x] Register səhifəsi yaradıldı (`app/[locale]/(auth)/register/page.tsx`)
- [x] Şifrəni unutdum səhifəsi yaradıldı (`app/[locale]/(auth)/forgot-password/page.tsx`)
- [x] Şifrə sıfırlama səhifəsi yaradıldı (`app/[locale]/(auth)/reset-password/page.tsx`)
- [x] Email doğrulama səhifəsi yaradıldı (`app/[locale]/(auth)/verify-email/page.tsx`)
- [x] Google OAuth düyməsi əlavə edildi (GIS script, `components/auth/GoogleAuthButton.tsx`)
- [x] Google OAuth inteqrasiyası tamamlandı (GIS → backend `/auth/google`)
- [x] Forma validasiyası (React Hook Form + Zod) tətbiq edildi
- [x] Token saxlama strategiyası (Zustand memory + httpOnly cookie)
- [x] Axios interceptor ilə auto token refresh tətbiq edildi
- [x] Auth layout yaradıldı (`app/[locale]/(auth)/layout.tsx` — split-screen premium dizayn)
- [x] UI komponentlər yaradıldı (`Input`, `Label`, `FormField`)
- [x] Unauthorized səhifəsi yaradıldı (`app/[locale]/unauthorized/page.tsx`)
- [x] `useAuth` hook-ları yazıldı (TanStack Query mutations)
- [x] `ProtectedRoute` komponenti yaradıldı
- [x] `useRole` hook yazıldı

---

## Mərhələ 3 — Layout & Naviqasiya
**Branch:** `feature/m03-layout`
**Status:** `[x]` Tamamlandı

- [x] Root layout yaradıldı (`app/layout.tsx` — font, providers)
- [x] Shop layout yaradıldı (`app/[locale]/(shop)/layout.tsx`)
- [x] Admin layout yaradıldı (`app/[locale]/admin/layout.tsx`)
- [x] Vendor layout yaradıldı (`app/[locale]/vendor/layout.tsx`)
- [x] `Navbar` komponenti yaradıldı (logo, axtarış, səbət sayğacı, profil dropdown)
- [x] `Footer` komponenti yaradıldı
- [x] `AdminSidebar` komponenti yaradıldı
- [x] `VendorSidebar` komponenti yaradıldı
- [x] `BottomTabs` komponenti yaradıldı (mobil)
- [x] `Breadcrumb` komponenti yaradıldı (JSON-LD daxil)
- [x] `navItems.ts` — rola görə naviqasiya elementləri
- [x] Sidebar açma/bağlama funksionallığı (`uiStore`)
- [x] Aktiv naviqasiya elementi vurğulandı (`usePathname`)
- [x] `LanguageSwitcher` komponenti yaradıldı
- [x] Responsive breakpoint-lər tənzimləndi
- [x] `next/font` konfiqurasiya edildi (FOUT yoxdur)

---

## Mərhələ 4 — Common Komponentlər
**Branch:** `feature/m04-common-components`

- [x] `Button.tsx` yaradıldı (5 variant, isLoading, icon dəstəyi)
- [x] `Input.tsx` yaradıldı (label, error, hint, icon, forwardRef)
- [x] `Modal.tsx` yaradıldı (size, footer, closeOnBackdrop)
- [x] `Badge.tsx` yaradıldı (5 variant, dot)
- [x] `Avatar.tsx` yaradıldı (ölçü, fallback)
- [x] `Spinner.tsx` yaradıldı
- [x] `Skeleton.tsx` yaradıldı (ProductCardSkeleton, ProductGridSkeleton)
- [x] `EmptyState.tsx` yaradıldı (icon, title, description, action)
- [x] `ErrorState.tsx` yaradıldı (message, onRetry)
- [x] `ErrorBoundary.tsx` yaradıldı
- [x] `Pagination.tsx` yaradıldı (showInfo daxil)
- [x] `ConfirmDialog.tsx` yaradıldı
- [x] `Table.tsx` yaradıldı
- [x] `DataTable.tsx` yaradıldı (sortable, selectable, actions, skeleton)
- [x] `StatCard.tsx` yaradıldı (dəyişim %, rəng)
- [x] `PageHeader.tsx` yaradıldı
- [x] `SearchBar.tsx` yaradıldı (debounce 300ms)
- [x] `PriceRange.tsx` yaradıldı (ikili slider)

---

## Mərhələ 5 — Kateqoriyalar

### 5.1 Backend
**Branch:** `feature/m05-categories-backend`

- [x] `GET /api/categories` — ağac strukturu ilə
- [x] `GET /api/categories/:slug` — tək kateqoriya
- [x] `POST /api/categories` — yarat (Admin)
- [x] `PUT /api/categories/:id` — yenilə (Admin)
- [x] `DELETE /api/categories/:id` — sil (Admin, məhsul yoxsa)
- [x] Kateqoriya şəkli yükləmə (Cloudinary)

### 5.2 Frontend
**Branch:** `feature/m05-categories-frontend`  
**Status:** `[x]` Tamamlandı

- [x] Kateqoriya siyahısı (navbar dropdown)
- [x] Kateqoriya səhifəsi yaradıldı (`/category/[slug]/page.tsx`)
- [x] `generateMetadata()` kateqoriya üçün
- [x] `generateStaticParams()` kateqoriyalar üçün
- [x] Admin: kateqoriya CRUD səhifəsi yaradıldı

---

## Mərhələ 6 — Məhsullar

### 6.1 Backend ✅
**Branch:** `feature/m06-products-backend`

- [x] `GET /api/products` — siyahı (filter, sort, pagination, axtarış)
- [x] `GET /api/products/:slug` — tək məhsul
- [x] `GET /api/products/featured` — öne çıxanlar
- [x] `GET /api/products/search` — autocomplete
- [x] `POST /api/products` — yarat (Admin/Vendor, şəkil yükləmə)
- [x] `PUT /api/products/:id` — yenilə (Admin/Vendor — öz məhsulu)
- [x] `DELETE /api/products/:id` — sil
- [x] `POST /api/products/:id/images` — şəkil əlavə et
- [x] `DELETE /api/products/:id/images/:imageId` — şəkil sil
- [x] Cloudinary inteqrasiyası (uploadToCloudinary — mövcud middleware istifadə edildi)
- [x] Multer middleware (uploadImage — mövcud middleware istifadə edildi)
- [x] Validasiya (express-validator)

### 6.2 Frontend
**Branch:** `feature/m06-products-frontend`

- [x] `ProductCard.tsx` yaradıldı (endirim %, stok overlay, hover)
- [x] `ProductGrid.tsx` yaradıldı (responsive grid)
- [x] `ProductFilters.tsx` yaradıldı (URL sync)
- [x] `ProductImages.tsx` yaradıldı (galereya, zoom, swipe)
- [x] `ProductSchema.tsx` yaradıldı (JSON-LD)
- [x] `StarRating.tsx` yaradıldı (display + interactive)
- [x] Məhsul siyahısı səhifəsi (`/products/page.tsx` — SSR)
- [x] Məhsul detalı səhifəsi (`/products/[slug]/page.tsx` — SSG+ISR)
- [ ] Axtarış səhifəsi (`/search/page.tsx` — SSR)
- [x] `generateMetadata()` məhsul detalı üçün
- [x] `generateStaticParams()` populyar məhsullar üçün
- [ ] Admin: məhsul siyahısı + CRUD panel
- [ ] Vendor: məhsullarım səhifəsi

---

## Mərhələ 7 — Səbət

### 7.1 Backend ✅
**Branch:** `feature/m07-cart-backend`  
**Status:** `[x]` Tamamlandı

- [x] `GET /api/cart` — səbəti al
- [x] `POST /api/cart/items` — məhsul əlavə et
- [x] `PATCH /api/cart/items/:productId` — miqdar dəyiş
- [x] `DELETE /api/cart/items/:productId` — məhsul çıxar
- [x] `DELETE /api/cart` — səbəti təmizlə

### 7.2 Frontend
**Branch:** `feature/m07-cart-frontend`

- [x] Zustand `cartStore` yaradıldı (persist — localStorage)
- [x] `CartItem.tsx` yaradıldı (+ / - miqdar, sil)
- [x] `CartSummary.tsx` yaradıldı (ara cəm, çatdırılma, ümumi)
- [x] Səbət səhifəsi yaradıldı (`/cart/page.tsx` — CSR)
- [x] Navbar-da səbət sayğacı (real-time)
- [x] Boş səbət vəziyyəti
- [x] Pulsuz çatdırılma progress barı

---

## Mərhələ 8 — Kuponlar

### 8.1 Backend ✅
**Branch:** `feature/m08-coupons-backend`  
**Status:** `[x]` Tamamlandı

- [x] `GET /api/coupons` — siyahı (Admin)
- [x] `POST /api/coupons` — yarat (Admin)
- [x] `PUT /api/coupons/:id` — yenilə (Admin)
- [x] `DELETE /api/coupons/:id` — sil (Admin)
- [x] `POST /api/coupons/validate` — kupon yoxla (Customer)

### 8.2 Frontend
**Branch:** `feature/m08-coupons-frontend`

- [ ] `CouponInput.tsx` yaradıldı (3 vəziyyət: boş, uğurlu, xəta)
- [x] Kupon CartSummary-ə inteqrasiya edildi
- [x] Admin: Kuponlar CRUD səhifəsi

---

## Mərhələ 9 — Ünvanlar

### 9.1 Backend ✅
**Branch:** `feature/m09-addresses-backend`  
**Status:** `[x]` Tamamlandı

- [x] `GET /api/addresses` — öz ünvanları
- [x] `POST /api/addresses` — ünvan əlavə et
- [x] `PUT /api/addresses/:id` — yenilə
- [x] `DELETE /api/addresses/:id` — sil
- [x] `PATCH /api/addresses/:id/default` — default et

### 9.2 Frontend ✅
**Branch:** `feature/m09-addresses-frontend`  
**Status:** `[x]` Tamamlandı

- [x] Ünvanlar səhifəsi yaradıldı (`/profile/addresses`)
- [x] Ünvan əlavə etmə forması (React Hook Form + Zod)
- [x] Default ünvan seçimi

---

## Mərhələ 10 — Ödəniş & Sifariş

### 10.1 Backend ✅
**Branch:** `feature/m10-payment-orders-backend`  
**Status:** `[x]` Tamamlandı

- [x] Stripe quraşdırıldı (`npm install stripe`)
- [x] `src/config/stripe.ts` yazıldı
- [x] `POST /api/payments/create-intent` — PaymentIntent yarat
- [x] `POST /api/payments/webhook` — Stripe webhook (RAW body)
- [x] `POST /api/payments/refund` — geri ödəniş (Admin)
- [x] `handlePaymentSuccess` — Prisma transaction
- [x] `handlePaymentFailure` — status yenilə
- [x] `handleRefund` — geri ödəniş emal
- [x] `POST /api/orders` — sifariş yarat (Customer)
- [x] `GET /api/orders` — bütün sifarişlər (Admin)
- [x] `GET /api/orders/my` — öz sifarişləri (Customer)
- [x] `GET /api/orders/:id` — tək sifariş (Admin/sahib)
- [x] `PATCH /api/orders/:id/status` — status dəyiş (Admin)
- [x] `POST /api/orders/:id/cancel` — ləğv et
- [x] Sifariş təsdiq emaili (Resend)
- [x] `generateOrderNumber` utility
- [x] Webhook route-u express.json()-dan əvvəl qeyd edildi

### 10.2 Frontend ✅
**Branch:** `feature/m10-payment-orders-frontend`  
**Status:** `[x]` Tamamlandı

- [x] `@stripe/stripe-js` + `@stripe/react-stripe-js` quraşdırıldı
- [x] `src/lib/stripe.ts` yazıldı (singleton)
- [x] `CheckoutForm.tsx` yaradıldı (ünvan seçimi, kupon)
- [x] `StripePayment.tsx` yaradıldı (PaymentElement)
- [x] Checkout səhifəsi yaradıldı (`/checkout/page.tsx` — CSR)
- [x] Sifariş uğur səhifəsi yaradıldı (`/order/success/[id]/page.tsx`)
- [x] Sifarişlər siyahısı (`/orders/page.tsx`)
- [x] Sifariş detalı (`/orders/[id]/page.tsx`)
- [ ] Admin: Sifarişlər paneli (filter, status dəyişmə)
- [ ] Stripe Webhook Stripe Dashboard-da konfiqurasiya edildi

---

## Mərhələ 11 — İstək Siyahısı

### 11.1 Backend ✅
**Branch:** `feature/m11-wishlist-backend`  
**Status:** `[x]` Tamamlandı

- [x] `GET /api/wishlist` — öz istək siyahısı
- [x] `POST /api/wishlist` — məhsul əlavə et
- [x] `DELETE /api/wishlist/:productId` — çıxar

### 11.2 Frontend ✅
**Branch:** `feature/m11-wishlist-frontend`  
**Status:** `[x]` Tamamlandı

- [x] İstək siyahısı səhifəsi (`/wishlist/page.tsx`)
- [x] Məhsul kartında ❤️ düyməsi (Zustand persist)
- [ ] Navbar-da istək siyahısı sayğacı
- [x] Zustand wishlistStore (localStorage persist)
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
| 1 — Qurulum | `[x]` tamamlandı | 100% |
| 2 — Auth | `[x]` tamamlandı | 100% |
| 3 — Layout | `[x]` tamamlandı | 100% |
| 4 — Komponentlər | `[x]` tamamlandı | 100% |
| 5 — Kateqoriyalar | `[x]` tamamlandı | 100% |
| 6 — Məhsullar | `[x]` tamamlandı | 100% |
| 7 — Səbət | `[x]` tamamlandı | 100% |
| 8 — Kuponlar | `[x]` tamamlandı | 100% |
| 9 — Ünvanlar | `[x]` tamamlandı | 100% |
| 10 — Ödəniş & Sifariş | `[x]` tamamlandı | 100% |
| 11 — İstək Siyahısı | `[x]` tamamlandı | 100% |
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
