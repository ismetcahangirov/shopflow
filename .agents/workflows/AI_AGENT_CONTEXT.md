# AI_AGENT_CONTEXT.md — ShopFlow
> Son yenilənmə: 2026-05-28

## Cari Vəziyyət
**Aktiv Branch:** `feature/m13-profile-backend`  
**Cari Mərhələ:** Mərhələ 13.1 — Profil Backend ✅  
**Status:** TypeScript ✅ | Lint ✅

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

## Növbəti Addımlar

1. **Mərhələ 13 — Profil & Parametrlər:**
   - GET/PUT /api/users/me — profil al/yenilə
   - PUT /api/users/me/password — şifrə dəyiş
   - POST /api/users/me/avatar — avatar yüklə
   - GET /api/users — bütün istifadəçilər (Admin)
   - PATCH /api/users/:id/status — aktiv/deaktiv (Admin)

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
