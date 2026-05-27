# AI_AGENT_CONTEXT.md — ShopFlow
> Son yenilənmə: 2026-05-27

## Cari Vəziyyət

**Aktiv Branch:** `feature/m06-products-backend`  
**Cari Mərhələ:** Mərhələ 6.1 — Məhsullar Backend (Tamamlandı, PR üçün hazır)  
**Status:** Bütün testlər ✅ | TypeScript ✅ | Lint ✅

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

**Test nəticəsi:** 94/94 frontend testi ✅ | 75/75 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

## Növbəti Addımlar

1. Bu branch üzrə PR açmaq və merge etmək.
2. Növbəti tapşırıq: **Mərhələ 6.2 — Məhsullar Frontend** (`ProductCard`, `ProductGrid`, `/products/page.tsx` SSR, `/products/[slug]/page.tsx` SSG+ISR, Admin/Vendor paneli).

## Əsas Texniki Qərarlar

| Qərar | Səbəb |
|---|---|
| JSON-LD Breadcrumb | Axtarış motorlarında daha yaxşı SEO nəticələri üçün strukturlaşdırılmış schema inteqrasiyası |
| Zustand state (`uiStore`) | Responsive mobil sidebar/menyuların və səbət drawer-lərinin vahid nöqtədən idarə olunması |
| Zustand hydration tracking (`isHydrated`) | Server və brauzer arasında baş verə biləcək HTML uyğunsuzluqlarının (hydration mismatch) qarşısını almaq |
| Premium Dark/Glassmorphic Stil | Vanilla Tailwind imkanları ilə premium, modern və dinamik interfeyslər |

## Vacib Qeydlər

- Client env: `client/.env.local` — `NEXT_PUBLIC_API_URL` və `NEXT_PUBLIC_GOOGLE_CLIENT_ID` lazımdır
- Server env: `server/.env` — `GOOGLE_CLIENT_ID` və `GOOGLE_CLIENT_SECRET` lazımdır
- Vitest testləri: `cd client && npm run test`
- Jest testləri: `cd server && npm run test`
- TypeScript yoxlaması: `cd client && npx tsc --noEmit` / `cd server && npx tsc --noEmit`
