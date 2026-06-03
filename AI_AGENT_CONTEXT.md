# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-06-03  
> Cari mərhələ: **Mərhələ 18 tamamlandı → Mərhələ 19 (Deploy & CI/CD) növbəti**

---

## Layihə Haqqında

**ShopFlow** — Next.js 14 + Express.js + PostgreSQL (Prisma) əsaslı tam funksional e-ticarət platforması.

- **Frontend:** `client/` — Next.js 14, TypeScript, Tailwind, Zustand, TanStack Query, next-intl (az/en/ru)
- **Backend:** `server/` — Express.js, TypeScript, Prisma ORM, PostgreSQL, Stripe, Resend
- **Testlər:** Jest + Supertest (backend), Vitest + RTL (frontend), Playwright (E2E)

---

## Son Tamamlanan Mərhələ: 18 — Təhlükəsizlik

**Branch:** `chore/m18-security`  
**PR:** Birləşdiriləcək

### Edilən işlər:

1. **Helmet & Security Headers:** Hər bir HTTP cavabı üçün təhlükəsizlik başlıqları (`CSP`, `HSTS`, `X-Content-Type-Options` və s.) konfiqurasiya edilib. CSP daxilində Stripe və Google inteqrasiyaları üçün qaydalar əlavə olunub.
2. **CORS Siyasəti:** Yalnız whitelist-də olan origin-lərdən (`config.CLIENT_URL`, `shopflow.az` və `www.shopflow.az`) gələn sorğulara icazə verilib.
3. **Rate Limiting:** Auth endpointləri (`/register`, `/login`, `/google` — 15 dəqiqədə 10 sorğu) və şifrə sıfırlama routes (`/forgot-password`, `/reset-password` — saatda 5 sorğu) üçün rate limiter tətbiq edilib.
4. **İnput Sanitization və Validasiya:** Bütün routes daxilində `express-validator` vasitəsilə input formatları, uzunluqları və verilənlər tipləri yoxlanılır. SQL injection-a qarşı Prisma parametrized query quruluşu təmin edilib.
5. **Əlavə Təhlükəsizlik:**
   - Bcrypt ilə şifrə hash-ləmə üçün `SALT_ROUNDS = 12` tətbiq edilib.
   - JWT secret açarları minimum 64 simvoldan ibarət olmaqla validate edilir.
   - Hər iki tərəfdə `.env` faylları `.gitignore` daxilindədir.
   - Client və server üzərində `noindex` meta tagləri gizli səhifələrə (`/admin`, `/vendor`, `/cart`, `/checkout`, `/profile`, `/orders`) şamil edilib.
   - Backend tərəfdə `npm audit --audit-level=high` uğurla keçdi (0 yüksək və kritik zəiflik tapıldı).

### Test nəticələri:
- Backend: **220/220 PASS** ✅
- Frontend: **181/181 PASS** ✅
- E2E (Playwright): Bütün testlər keçdi ✅
- Backend lint & TS yoxlama: Uğurlu ✅
- Frontend lint & TS yoxlama: Uğurlu ✅

---

## Növbəti Mərhələ: 19 — Deploy & CI/CD

**Branch açılacaq:** `chore/m19-deployment`

### Tapşırıqlar:
- Supabase, Cloudinary, Resend, Stripe production hesablarının qurulması və inteqrasiyası.
- Render (backend) və Vercel (frontend) deploy sənədlərinin (`render.yaml`, `vercel.json`) hazırlanması və deploy edilməsi.
- GitHub Actions pipeline konfiqurasiyası (`.github/workflows/ci.yml`).
- Deploy sonrası production verify yoxlanışları.

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
