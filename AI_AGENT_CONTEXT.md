# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-06-03  
> Cari mərhələ: **Mərhələ 17 tamamlandı → Mərhələ 18 (Təhlükəsizlik) növbəti**

---

## Layihə Haqqında

**ShopFlow** — Next.js 14 + Express.js + PostgreSQL (Prisma) əsaslı tam funksional e-ticarət platforması.

- **Frontend:** `client/` — Next.js 14, TypeScript, Tailwind, Zustand, TanStack Query, next-intl (az/en/ru)
- **Backend:** `server/` — Express.js, TypeScript, Prisma ORM, PostgreSQL, Stripe, Resend
- **Testlər:** Jest + Supertest (backend), Vitest + RTL (frontend), Playwright (E2E)

---

## Son Tamamlanan Mərhələ: 17.3 — E2E Testlər

**Branch:** `test/m17-e2e-tests`  
**PR:** Açılacaq

### Edilən işlər:

1. **`client/e2e/auth.spec.ts`** — Mövcud idi; qeydiyyat → login → logout axını
2. **`client/e2e/shopping.spec.ts`** — YENİ YARADILDI:
   - Unikal email ilə qeydiyyat + login
   - `/az/products/iphone-15-pro-256gb` məhsul detal səhifəsi
   - `[data-testid="add-to-cart-btn"]` ilə səbətə əlavə etmə
   - CartDrawer açılmasının yoxlanılması
   - `Sifarişi rəsmiləşdir` linki → `/az/checkout` yönlənməsi
   - SEO meta tag + hreflang yoxlaması
3. **`client/src/components/products/ProductCard.tsx`**:
   - `useAuthStore`, `useCartStore`, `useUiStore` hook-ları əlavə edildi
   - `handleAddToCart` funksiyası implementasiya edildi (auth yoxlaması ilə)
   - `data-testid="add-to-cart-btn-card"` əlavə edildi
4. **`client/src/app/[locale]/(shop)/products/[slug]/ProductDetailClient.tsx`**:
   - `handleAddToCart`, `handleBuyNow` funksiyaları implementasiya edildi
   - `showSuccess` / `error` state-ləri və UI feedback əlavə edildi
   - `data-testid="add-to-cart-btn"` əlavə edildi
5. **`client/src/components/layout/Navbar.tsx`**:
   - Səbət ikonası düyməsinə `data-testid="cart-icon"` əlavə edildi
6. **`client/vitest.config.ts`**:
   - `exclude: ['e2e/**']` əlavə edildi — Playwright spec-ləri Vitest tərəfindən çalışdırılmırdı

### Test nəticələri:
- Backend: **220/220 PASS** ✅
- Frontend: **181/181 PASS** ✅
- Backend lint: ✅ Təmiz
- Frontend lint: ✅ Təmiz
- Backend TypeScript: ✅ 0 xəta
- Frontend TypeScript: ✅ 0 xəta

---

## Növbəti Mərhələ: 18 — Təhlükəsizlik

**Branch açılacaq:** `chore/m18-security`

### Tapşırıqlar:
- Helmet middleware (CSP, HSTS)
- CORS yalnız shopflow.az üçün
- Rate limiting auth endpointlərindədir
- Input sanitization
- `npm audit` keçməlidir

---

## Texniki Arxitektura

### Backend Əsas Fayllar
```
server/src/
  controllers/   — asyncHandler ilə sarılmış controller-lər
  routes/        — protect → authorize → validate → controller sırası
  middleware/    — auth, error, validate
  utils/         — AppError, successResponse, generateToken, logger
  config/        — db.ts (Prisma), env.ts
  tests/         — Jest integration testlər
```

### Frontend Əsas Fayllar
```
client/src/
  app/[locale]/  — Next.js 14 App Router, next-intl
  components/    — UI + layout + feature komponentlər
  store/         — Zustand: authStore, cartStore, uiStore, wishlistStore, couponStore
  hooks/         — useProducts, useOrders, useRole, useAuth
  lib/           — api.ts (axios + interceptors)
  types/         — index.ts (bütün TypeScript tipləri)
e2e/             — Playwright E2E testlər
```

### Vacib Qaydalar
- Backend: `asyncHandler` + `AppError` + `successResponse` — istisnasız
- Frontend: `useCartStore` addItem → `useUiStore` openCart → CartDrawer açılır
- Cart API: `protect` middleware — autentifikasiya mütləqdir
- i18n: az.json → en.json → ru.json (eyni anda 3 dildə)
- `console.log` yoxdur — `logger` istifadə et

---

## Seeded Test Məlumatları

| Rol | Email | Şifrə |
|-----|-------|-------|
| Admin | admin@shopflow.az | Admin@1234 |
| Customer | customer@test.az | Customer@1234 |
| Vendor | vendor@test.az | Vendor@1234 |

**Seeded məhsullar:**
- `iphone-15-pro-256gb` — ₼2499.99, stok: 50
- `samsung-galaxy-s24-ultra` — ₼2199.99, stok: 30
