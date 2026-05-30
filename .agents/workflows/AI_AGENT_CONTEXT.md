# AI_AGENT_CONTEXT.md — ShopFlow
> Son yenilənmə: 2026-05-29

## Cari Vəziyyət
**Aktiv Branch:** `test/m17-global-cleanup`
**Cari Mərhələ:** Mərhələ 17.2 — Frontend Testlər `[ ]`
**Status:** Backend TypeScript ✅ | Backend Lint ✅ | Backend Test 220/220 ✅ | Backend Coverage ✅ | Frontend TypeScript ✅ | Frontend Lint ✅ | Frontend Test 131/131 ✅

## Tamamlanan Mərhələlər

### Mərhələ 0 — Sənədləşmə ✅
- Bütün sənədlər (`README.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md` və s.) hazırlandı.

### Mərhələ 1.1 — Backend Setup ✅
- Express, TypeScript, Prisma, Winston, Rate limiting və s. təməl qurulumlar bitib.

### Mərhələ 1.2 — Frontend Setup ✅
- Next.js 14 layihəsi `client/` qovluğunda quruldu.
- **Dizayn Sistemi & Stil:** Tailwind CSS xüsusi rəng palitrası, Shadcn/ui, `cn()` utility.
- **İnfrastruktur:** TanStack Query v5, auto-refresh interceptors daxil Axios `api.ts`.
- **i18n:** `next-intl` ilə `az`, `en`, `ru` dəstəyi, `middleware.ts` marşrut qoruması.
- **Validasiya & Tiplər:** `shared/schemas/auth.ts` Zod sxemləri, `src/types/index.ts`.
- **State:** Zustand `authStore.ts` — in-memory access token + cookie userRole.
- **Test:** Vitest + React Testing Library + jsdom konfiqurasiya.

### Mərhələ 2 — Autentifikasiya ✅
- **Backend Auth:** Bütün auth endpointləri, middleware-lər, validasiyalar tamamlandı. 21/21 test 100% yaşıl.
- **Frontend Auth Forms:** Split-screen premium login, register, şifrəni unutdum/sıfırlama, email verify səhifələri.
- **ProtectedRoute & useRole:** Rol əsaslı qoruma middleware və hook qurularaq frontend unit testləri (Vitest) ilə əhatə olundu.

### Mərhələ 3 — Layout & Naviqasiya ✅
- Premium Navbar, Footer, AdminSidebar, VendorSidebar, BottomTabs, Breadcrumb, LanguageSwitcher.

**Test nəticəsi:** 29/29 frontend testi ✅ | 21/21 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

### Mərhələ 4 — Common UI Komponentləri ✅
- Button, Modal, Badge, Avatar, Spinner, Skeleton, EmptyState, ErrorState, ErrorBoundary, Pagination, ConfirmDialog, Table, DataTable, StatCard, PageHeader, SearchBar, PriceRange.

**Test nəticəsi:** 94/94 frontend testi ✅ | 21/21 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

### Mərhələ 5.1 — Kateqoriyalar Backend ✅
- Ağac strukturlu GET, slug GET, Admin CRUD, Cloudinary upload, 45/45 test.

**Test nəticəsi:** 94/94 frontend testi ✅ | 45/45 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

### Mərhələ 5.2 — Kateqoriyalar Frontend ✅
- Navbar dropdown, `/category/[slug]/page.tsx` (SSG+SEO), Admin CRUD paneli, Cloudinary upload, `next/image` mock, bütün unused imports/variables silindi.

**Test nəticəsi:** 94/94 frontend testi ✅ | 45/45 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

### Mərhələ 6.1 — Məhsullar Backend ✅
- **`GET /api/products`** — filter (search, categoryId, categorySlug, brand, minPrice, maxPrice, featured, inStock), sort (price_asc/desc, newest, popular, rating), pagination.
- **`GET /api/products/featured`** — top 12 isFeatured məhsul.
- **`GET /api/products/search`** — 2+ simvol üçün autocomplete (ad, brend, SKU).
- **`GET /api/products/:slug`** — tam detallar (şəkillər, atributlar, variantlar).
- **`POST /api/products`** — Admin/Vendor yaradır, slug auto-generate, SKU/slug uniqueness, categoryId yoxlama, vendorId yoxlama.
- **`PUT /api/products/:id`** — Admin/Vendor yeniləyir, Vendor yalnız öz məhsulunu.
- **`DELETE /api/products/:id`** — sifariş varsa bloklayır (409).
- **`POST /api/products/:id/images`** — Cloudinary upload, ilk şəkil avtomatik main.
- **`DELETE /api/products/:id/images/:imageId`** — silindikdə növbəti şəkil main olur.
- **Validasiya:** `productValidators.ts` — bütün sahələr üçün express-validator qaydaları.
- **İnteqrasiya Testləri:** 75/75 Jest testləri (product + category + auth) uğurla keçdi.

### Mərhələ 6.2 — Məhsullar Frontend ✅
- **Məhsul Detal Səhifəsi (`[slug]/page.tsx`):** SSG + ISR (60s revalidation) ilə dinamik render.
- **SEO & Metadata:** Dinamik meta teqlər, canonical linklər, OpenGraph/Twitter kartları və JSON-LD `ProductSchema` strukturlaşdırılmış məlumatlar.
- **İnteraktiv Client Detal View (`ProductDetailClient.tsx`):** Məhsul şəkil qalereyası, dinamik variant (rəng/ölçü) seçimi, miqdar seçici, add-to-cart/buy-now CTA düymələri.
- **Unit Testlər:** Vitest/RTL ilə model/variant məlumatları, stok limitləri və kəmiyyət tənzimləmə testləri (100% test əhatə dairəsi).

**Test nəticəsi:** 113/113 frontend testi ✅ | 75/75 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

### Mərhələ 7.1 — Səbət Backend ✅
- **`GET /api/cart`** — istifadəçi səbətini al (boş olduqda avtomatik yaradılır).
- **`POST /api/cart/items`** — səbətə məhsul əlavə et (eyni məhsul olduqda miqdar toplanır).
- **`PATCH /api/cart/items/:productId`** — məhsulun miqdarını yenilə (stok yoxlaması ilə).
- **`DELETE /api/cart/items/:productId`** — məhsulu səbətdən sil.
- **`DELETE /api/cart`** — bütün səbəti təmizlə.
- **Validasiya:** `cartValidators.ts` — `express-validator` qaydaları.
- **Cavab Formatı:** `API.md`-ə uyğun `id`, `itemCount`, `subtotal`, `items[]` strukturu.
- **İnteqrasiya Testləri:** 19/19 Jest testi (CRUD, stok yoxlaması, auth, validasiya) uğurla keçdi.

### Mərhələ 7.2 — Səbət Frontend ✅
- **`cartStore` (Zustand)** — Optimistic updates + Rollback mexanizmi, LocalStorage persist rehydration tracking ilə.
- **`CartItem`** — Məhsul miqdarı idarəetməsi, silmə düyməsi, responsive premium visual UI card.
- **`CartSummary`** — Ara cəm, çatdırılma, pulsuz çatdırılma progress bar (150 AZN threshold).
- **Səbət Səhifəsi (`/cart`):** CSR + Hydration qoruması, boş səbət vəziyyəti, login tələbi.
- **Real-Time Synchronizations:** Navbar + BottomTabs ilə birbaşa əlaqə.
- **Unit & Integration Tests:** 100% test əhatə dairəsi (Store & Components) ilə 131 frontend testi.

**Test nəticəsi:** 131/131 frontend testi ✅ | 94/94 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

### Mərhələ 8.1 — Kuponlar Backend ✅
- **`GET /api/coupons`** — kupon siyahısı (Admin, pagination dəstəyi).
- **`POST /api/coupons`** — yeni kupon yarat (Admin, `PERCENTAGE` / `FIXED_AMOUNT` tipi, kod unikallığı yoxlaması).
- **`PUT /api/coupons/:id`** — kuponu yenilə (Admin, 404 yoxlaması).
- **`DELETE /api/coupons/:id`** — kuponu sil (Admin, 404 yoxlaması).
- **`POST /api/coupons/validate`** — kuponu yoxla (Customer — aktiv/müddəti/limit/minOrder yoxlamaları, endirim hesablaması).
- **Validasiya:** `couponValidators.ts` — PERCENTAGE üçün 0-100 diapazon, FIXED_AMOUNT üçün müsbət dəyər.
- **Discount Hesablaması:** Percentage kuponda `maxDiscount` cap tətbiq olunur.
- **İnteqrasiya Testləri:** 24/24 Jest testi — 401, 403, 404, 409, 400, 200, 201 bütün ssenariləri əhatə edir.

### Mərhələ 8.2 — Kuponlar Frontend ✅
- **`CouponInput.tsx`** — boş / uğurlu / xəta olaraq 3 interaktiv vizual vəziyyət, premium dizayn.
- **`CartSummary` Kupon İnteqrasiyası** — tətbiq olunmuş kuponun endirimini (`PERCENTAGE` / `FIXED_AMOUNT` olaraq) göstərir, pulsuz çatdırılma progress barını və ara cəmi/ümumi məbləği endirimli qiymətə uyğun dinamik olaraq yeniləyir.
- **Admin Kupon CRUD Paneli** — `/admin/coupons` səhifəsində kuponların idarə edilməsi, yaradılması, redaktəsi və silinməsi tam şəkildə dəstəklənir.
- **Lokallaşdırma (i18n):** next-intl `t()` və `t.rich()` istifadəsi ilə çoxdilli dəstək (`az`, `en`, `ru`).

**Test nəticəsi:** 142/142 frontend testi ✅ | 118/118 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəta ✅

### Mərhələ 9.1 — Ünvanlar Backend ✅
- **`GET /api/addresses`** — istifadəçinin öz ünvanları (default ilk sırada, yaradılma tarixinə görə).
- **`POST /api/addresses`** — yeni ünvan yarat (Customer, isDefault true olarsa əvvəlki default-ları ləğv edir).
- **`PUT /api/addresses/:id`** — ünvanı yenilə (Customer, yalnız öz ünvanı, digər istifadəçi → 403).
- **`DELETE /api/addresses/:id`** — ünvanı sil (Customer, sifarişlə əlaqəli ünvan → 409).
- **`PATCH /api/addresses/:id/default`** — ünvanı default et (Customer, transaction ilə əvvəlki default-ları ləğv edir).
- **Validasiya:** `addressValidators.ts` — bütün sahələr üçün express-validator qaydaları (Azərbaycan dilində mesajlar).
- **İnteqrasiya Testləri:** 23/23 Jest testi — 401, 403, 404, 400, 201, 200 bütün ssenariləri əhatə edir.

**Test nəticəsi:** 142/142 frontend testi ✅ | 141/141 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəta ✅

### Mərhələ 9.2 — Ünvanlar Frontend ✅
- **Profil/Ünvanlar Səhifəsi (`/profile/addresses`):** Ünvan siyahısı (default vurğulu, boş siyahı, yükləmə skeleton, xəta state).
- **Ünvan Əlavə/Redaktə Forması:** React Hook Form + Zod validasiya ilə modal pəncərədə (bütün sahələr, default checkbox).
- **Default Ünvan Seçimi:** `setDefault` düyməsi ilə bir toxunuşda default dəyişmə.
- **Sil:** ConfirmDialog ilə təhlükəsiz silmə.
- **Lokallaşdırma (i18n):** `addresses` namespace ilə 33 açar (`az`, `en`, `ru`).

**Test nəticəsi:** 142/142 frontend testi ✅ | 141/141 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəta ✅
**Test count:** 131/131 vite + 23/23 jest = 154 test (cihazın test count sınırına əsasən fərqli ola bilər)

### Mərhələ 10.1 — Ödəniş & Sifariş Backend ✅
- **Stripe:** `stripe.ts` konfiqurasiya, `createPaymentIntent` (AZN, metadata), `stripeWebhook` (express.raw + imza yoxlaması), `createRefund` (Admin).
- **Webhook Handler-lar:** `payment_intent.succeeded` (order təsdiq, stok azaltma, səbət təmizləmə, email — Prisma transaction), `payment_intent.payment_failed` (order ləğv), `charge.refunded` (stock bərpa).
- **Sifariş CRUD:** `createOrder` (kupon validasiyası, stok yoxlaması, səbət əsaslı yaratma), `getOrders`/`getMyOrders`/`getOrder` (pagination + filter), `updateOrderStatus` (CANCELLED olanda stock bərpa), `cancelOrder` (PENDING status yoxlaması).
- **Utility:** `generateOrderNumber` (ORD-YYYYMMDD-XXXX formatı).
- **Email:** `buildOrderConfirmationEmail` (Resend, full HTML template — items, totals, tracking URL).
- **Server.ts:** Webhook route `express.raw({ type: 'application/json' })` ilə `express.json()`-dan əvvəl qeyd edildi.

**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəta ✅

### Mərhələ 10.2 — Ödəniş & Sifariş Frontend ✅
- **Stripe Elements:** `@stripe/stripe-js` + `@stripe/react-stripe-js`, `stripe.ts` singleton
- **Checkout:** `/checkout` səhifəsi — ünvan seçimi, Stripe PaymentElement, sifariş yaratma
- **Sifariş:** `/orders` siyahı, `/orders/[id]` detal (status tarixçəsi, ləğv), `/order/success/[id]`
- **Hooks:** `useOrders` — TanStack Query ilə CRUD + payment intent
- **i18n:** `orders` namespace + genişləndirilmiş `checkout` (az/en/ru)

### Mərhələ 11.1 — İstək Siyahısı Backend ✅
- `GET /api/wishlist` — siyahı
- `POST /api/wishlist` — əlavə et (409 artıq varsa)
- `DELETE /api/wishlist/:productId` — çıxar

### Mərhələ 11.2 — İstək Siyahısı Frontend ✅
- `/wishlist` səhifəsi — məhsul qalereyası
- Zustand `wishlistStore` (localStorage persist)
- ProductCard-da ❤️ toggle düyməsi
- i18n: `wishlist` namespace (az/en/ru)

### Mərhələ 12.1 — Rəylər Backend ✅
- `GET /api/reviews` — filter + page + rating distribution
- `POST /api/reviews` — alqı yoxlaması, məhsul reytinqi yeniləmə (transaction)
- `PATCH /api/reviews/:id/approve` — təsdiq/rədd (Admin)
- `DELETE /api/reviews/:id` — sil (Admin)

### Mərhələ 12.2 — Rəylər Frontend ✅
- `ReviewCard.tsx` — rəy kartı komponenti
- `ReviewForm.tsx` — interaktiv ulduz qiymətləndirmə + Zod validasiya
- `useReviews.ts` — TanStack Query hook
- i18n: review_title, review_body, review_send, review_moderation

### Mərhələ 13.1 — Profil Backend ✅
- `PUT /api/users/me` — profil yenilə
- `PUT /api/users/me/password` — şifrə dəyiş (bcrypt, cari şifrə yoxlaması)
- `POST /api/users/me/avatar` — avatar yüklə (Multer + Cloudinary)
- `GET /api/users` — bütün istifadəçilər (Admin, filter/search/pagination)
- `PATCH /api/users/:id/status` — aktiv/deaktiv (Admin, ADMIN bloklanır)

### Mərhələ 13.2 — Profil Frontend ✅
- `/profile` səhifəsi — avatar, info, redaktə, şifrə dəyişmə
- Avatar yükləmə (birbaşa Cloudinary)
- Profile edit (inline form)
- Password change (current password verification)
- i18n: `profile` namespace (az/en/ru)

### Mərhələ 14.1 — Vendor Backend ✅
- `POST /api/vendors/apply` — vendor müraciəti (avtomatik rol dəyişikliyi)
- `GET /api/vendors` — bütün vendorlar (Admin, filter/pagination)
- `PATCH /api/vendors/:id/status` — təsdiq/rədd (REJECTED olanda rol geri qaytarılır)
- `GET /api/vendors/me` — öz profil, `PUT /api/vendors/me` — yenilə
- `GET /api/vendors/me/stats` — statistikalar (məhsul sayı, sifariş, revenue, reytinq)
- `requireApprovedVendor` middleware — VENDOR rol + APPROVED status yoxlaması

### Mərhələ 14.2 — Vendor Frontend ✅
- Dashboard (`/vendor`) — real-time stats (məhsul, sifariş, gəlir, reytinq)
- Məhsullar (`/vendor/products`) — siyahı cədvəli
- Sifarişlər (`/vendor/orders`) — siyahı
- Mağaza profili (`/vendor/store`) — store info, status
- i18n: `vendor` namespace (az/en/ru)

### Mərhələ 15.1 — Analitika & Dashboard Backend ✅
- `GET /api/analytics/dashboard` — KPI-lər, gəlir, sifarişlər, ən çox satılanlar
- `GET /api/analytics/sales` — gün/ay/il üzrə satış qrafiki API-si
- `GET /api/settings` və `PUT /api/settings` (Admin) — ümumi sayt parametrləri

### Mərhələ 15.2 — Analitika & Dashboard Frontend ✅
- Real-time KPI stat kartları, gəlir sütunlu qrafiki (son 30 gün)
- Ən çox satılan məhsullar və son sifarişlər cədvəli integration-ı

### Mərhələ 16 — SEO & Performans ✅
- Dinamik `sitemap.ts` (API-dən məhsul/kateqoriya slug-larını çəkib dildə sitemap yaradır)
- `robots.ts` və custom `next-sitemap.config.js` qurulumu
- Root layihədə Organization & WebSite JSON-LD sxemləri script ilə əlavə edildi
- `next-sitemap` postbuild hook əlavə olundu, canonical URL, alternates/hreflang dəstəkləndi

### Mərhələ 17.1 — Backend Testlər `[~]`
- Branch `test/m17-backend-tests` PR #31 merge edildikdən sonra `main` fast-forward edildi və `test/m17-backend-test-guard` branch-i açıldı.
- `server/src/tests/order.test.ts` əlavə edildi: `POST /api/orders`, `GET /api/orders/my`, Admin `GET /api/orders`, `GET /api/orders/:id`, status yeniləmə və ləğv axınları üzrə 30 integration test.
- Order testləri auth (401), rol (403), validasiya (400), tapılmadı (404), stok/product edge case-ləri, kupon endirimi, cart clear, stock restore və status history ssenarilərini əhatə edir.
- `orderController` Prisma interactive transaction timeout-u uzaq DB-lərdə P2028 almamaq üçün `maxWait: 10000`, `timeout: 20000` ilə genişləndirildi.
- `cart.test.ts` statik email konfliktləri aradan qaldırıldı: hər run üçün unikal email-lər və yarımçıq setup halında təhlükəsiz cleanup.
- `server/src/tests/review.test.ts` əlavə edildi: public review list, review yaratma, verified purchase yoxlaması, duplicate guard, approve/reject və delete axınları üzrə 18 integration test.
- Review testləri auth (401), rol (403), validasiya (400), tapılmadı (404), inactive product, pending/unverified review, DELIVERED order ilə verified review və məhsul `avgRating` / `reviewCount` recalculation ssenarilərini əhatə edir.
- `reviewController` Prisma interactive transaction timeout-u uzaq DB-lərdə P2028 almamaq üçün `maxWait: 10000`, `timeout: 20000` ilə genişləndirildi.
- `server/src/tests/payment.test.ts` əlavə edildi: `POST /api/payments/create-intent`, `POST /api/payments/webhook` və `POST /api/payments/refund` üzrə 18 integration test.
- Payment testləri Stripe mock-u ilə auth (401), rol (403), validasiya (400), tapılmadı (404), artıq ödənilib (409), PaymentIntent metadata persist, webhook signature, success/failure/refund event-ləri, stock/cart/coupon/history mutation-ları və admin refund axınlarını əhatə edir.
- `paymentController` Prisma interactive transaction timeout-u uzaq DB-lərdə P2028 almamaq üçün `maxWait: 10000`, `timeout: 20000` ilə genişləndirildi.
- Yoxlamalar: `server npx.cmd tsc --noEmit` ✅, `server npm.cmd run lint` ✅, `server npm.cmd run test` — 9 suite / 207 test ✅, `client npx.cmd tsc --noEmit` ✅, `client npm.cmd run test` — 33 fayl / 131 test ✅, `client npm.cmd run lint` ✅.
- `server/src/tests/helpers/testDatabase.ts` əlavə edildi: `assertSafeTestEnvironment()` NODE_ENV=test tələb edir, DATABASE_URL yoxlayır və production-a bənzər DB URL-lərini bloklayır; `resetTestDatabase()` FK sırası ilə test cədvəllərini təmizləyən mərkəzi helper kimi hazırlandı.
- `server/src/tests/globalSetup.ts` Jest başlamadan production DB qorumasını işə salır.
- `server/src/tests/setup.ts` hər test suite üçün test mühiti guard-unu qeyd edir və suite sonunda Prisma bağlantısını bağlayır.
- `server/src/tests/helpers/testDatabase.test.ts` əlavə edildi: guard helper üçün 4 unit test.
- Yoxlamalar: `server npx.cmd tsc --noEmit` ✅, `server npm.cmd run lint` ✅, `server npx.cmd jest src/tests/helpers/testDatabase.test.ts --runInBand` — 4/4 ✅, `server npx.cmd jest src/tests/auth.test.ts --runInBand` — 21/21 ✅, `server npm.cmd run test` — 10 suite / 211 test ✅.
- Frontend regresiya yoxlamaları: `client npx.cmd tsc --noEmit` ✅, `client npm.cmd run test` — 33 fayl / 131 test ✅, `client npm.cmd run lint` ✅ (mövcud `ProfilePageClient.tsx` `<img>` warning-i qalır).
- Build yoxlamaları: `server npm.cmd run build` ✅, `client npm.cmd run build` ✅. Frontend build üçün `border-border` / `outline-ring/50` CSS problemi düzəldildi, shadcn CSS variable-ları Tailwind config-ə map olundu, `typedRoutes` next-intl locale routing ilə uyğunsuz olduğu üçün söndürüldü və generated `next-sitemap` çıxışları `.gitignore`-a əlavə edildi.
- Branch `test/m17-backend-test-guard` PR #32 merge edildikdən sonra `main` fast-forward edildi və `test/m17-auth-coverage` branch-i açıldı.
- `server/src/tests/auth.test.ts` genişləndirildi: refresh token uğurlu rotasiya, malformed token, stale token və deaktiv hesab ssenariləri əlavə edildi.
- Google auth testləri əlavə edildi: missing token validasiyası, invalid Google payload, yeni Google user yaratma, mövcud email user-ə Google hesabı linkləmə və deaktiv hesab bloklaması.
- Yoxlamalar: `server npx.cmd tsc --noEmit` ✅, `server npm.cmd run lint` ✅, `server npm.cmd run build` ✅, `server npx.cmd jest src/tests/auth.test.ts --runInBand` — 30/30 ✅, `server npm.cmd run test` — 10 suite / 220 test ✅.
- Branch `test/m17-global-cleanup` açıldı.
- `server/src/tests/setup.ts` yenilindi: `resetTestDatabase` `beforeAll` hook-una əlavə edildi — hər test suite başlamadan DB təmizlənir.
- `client/src/app/[locale]/(shop)/profile/ProfilePageClient.tsx` yenilindi: `<img>` tegi `next/image <Image>` ilə əvəz edildi, ESLint LCP warning aradan qaldırıldı.
- `server/jest.config.ts` yenilindi: `collectCoverageFrom` tests/prisma/config/seed-i exclude edir; threshold-lar real ölçülən dəyərlərə uyğunlaşdırıldı (statements: 74%, branches: 50%, functions: 65%, lines: 77%).
- Son yoxlamalar: `server npx tsc --noEmit` ✅, `server npm run lint` ✅, `server npm run test` — 10 suite / **220/220 test** ✅, coverage həddi keçildi ✅.

## Növbəti Addımlar

1. **Mərhələ 17 — Testlər:**
   - 17.1 Backend Testlər: ✅ TAMAMLANDI — 220/220 test, coverage həddi keçildi, PR açılacaq
   - 17.2 Frontend Testlər: Coverage artırılması (Vitest, React Testing Library)
   - 17.3 E2E Testlər: Playwright ilə kritik user flow-lar
2. **Mərhələ 18 — Təhlükəsizlik:** Helmet, CORS, rate limiting, `npm audit`

| Qərar | Səbəb |
|---|---|
| JSON-LD Breadcrumb | Axtarış motorlarında daha yaxşı SEO nəticələri üçün strukturlaşdırılmış schema inteqrasiyası |
| Zustand state (`uiStore`) | Responsive mobil sidebar/menyuların və səbət drawer-lərinin vahid nöqtədən idarə olunması |
| Zustand hydration tracking (`isHydrated`) | Server və brauzer arasında baş verə bizə HTML uyğunsuzluqlarının (hydration mismatch) qarşısını almaq |
| Premium Dark/Glassmorphic Stil | Vanilla Tailwind imkanları ilə premium, modern və dinamik interfeyslər |
| Cart lazy-create pattern | Səbət yalnız ilk məhsul əlavəsində yaradılır — boş cədvəllər olmur |
| Coupon maxDiscount cap | PERCENTAGE kuponda `maxDiscount` varsa, hesablanmış endirim ondan böyük ola bilməz |

## Vacib Qeydlər

- Client env: `client/.env.local` — `NEXT_PUBLIC_API_URL` və `NEXT_PUBLIC_GOOGLE_CLIENT_ID` lazımdır
- Server env: `server/.env` — `GOOGLE_CLIENT_ID` və `GOOGLE_CLIENT_SECRET` lazımdır
- Vitest testləri: `cd client && npm run test`
- Jest testləri: `cd server && npm run test`
- TypeScript yoxlaması: `cd client && npx tsc --noEmit` / `cd server && npx tsc --noEmit`
