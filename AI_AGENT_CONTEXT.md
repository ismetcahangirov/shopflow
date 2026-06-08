# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-06-08 (Admin və Vendor Məhsul CRUD Panelləri əlavə edildi)  
> Cari mərhələ: **Mərhələ 6.2 tamamlandı (Admin/Vendor CRUD panelləri daxil), Mərhələ 19 (Deploy & CI/CD) davam edir**

---

## Layihə Haqqında

**ShopFlow** — Next.js 14 + Express.js + PostgreSQL (Prisma) əsaslı tam funksional e-ticarət platforması.

- **Frontend:** `client/` — Next.js 14, TypeScript, Tailwind, Zustand, TanStack Query, next-intl (az/en/ru)
- **Backend:** `server/` — Express.js, TypeScript, Prisma ORM, PostgreSQL, Stripe, Resend
- **Testlər:** Jest + Supertest (backend), Vitest + RTL (frontend), Playwright (E2E)

---

## Son Tamamlanan Mərhələ: 18 — Təhlükəsizlik

**Branch:** `chore/m18-security`  
**PR:** Birləşdirilib ✅

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
- Backend: **220/220 PASS** (bəzi mühitlərdə DB latency-dən asılı olaraq yavaş çalışa bilər) ✅
- Frontend: **185/185 PASS** (Vitest testləri uğurla tamamlandı) ✅
- E2E (Playwright): Bütün E2E testləri uğurla tamamlanıb ✅
- Backend lint & TS yoxlama: Uğurlu ✅
- Frontend lint & TS yoxlama: Uğurlu ✅

---

## Cari Mərhələ: 19 — Deploy & CI/CD

**Branch:** `chore/m19-deployment`

### Tamamlanan işlər:
- Vercel üçün həm `client` (`vercel.json`), həm də `server` (`vercel.json`, `server/api/index.ts` entrypoint) konfiqurasiyaları yazıldı.
- Frontend canlı olaraq deploy olundu → https://shopflow-theta.vercel.app
- Backend Express app Vercel Serverless Functions kimi deploy olundu → https://api-shopflow.vercel.app
- `.github/workflows/ci.yml` pipeline (Lint, Test, Audit, Build) uğurla yazıldı.
- `DEPLOYMENT.md` sənədi yeniləndi və Vercel konfiqurasiyasına uyğunlaşdırıldı.

### Növbəti Addımlar (User tərəfindən icra ediləcəklər):
- GitHub Repository panelində lazımi Secret-lərin (`JWT_SECRET`, `NEXT_PUBLIC_API_URL` və s.) tənzimlənməsi.
- Vercel Panelində backend layihəsinin mühit dəyişənlərinin (Supabase `DATABASE_URL` və `DIRECT_URL`) konfiqurasiyası.
- Stripe webhook və Resend production inteqrasiyalarının tamamlanması.
- Deploy sonrası `GET /api/health` verify testi və ümumi yoxlama siyahısının icrası.

---

## Son Agent Tapşırığı: Mərhələ 6.2 — Admin və Vendor Məhsul CRUD Panelləri

**Branch:** `feature/m06-admin-vendor-products`

### Tamamlanan işlər:
- `client/src/app/[locale]/admin/products/page.tsx` yaradıldı/tənzimləndi: Admin üçün yüksək keyfiyyətli məhsul CRUD paneli, axtarış, filtrasiya və multi-tab modal formu.
- `client/src/app/[locale]/vendor/products/page.tsx` yaradıldı: Satıcılar üçün məhsulların idarə edilməsi paneli, yalnız öz məhsullarını görmə, redaktə etmə və silmə imkanı, eyni CRUD modalı və fərqli icazələr.
- `server/src/controllers/productController.ts` yeniləndi: `GET /api/products` endpointi `vendorId` və `isActive` filtrlərini dəstəkləyir. Admin/Vendor rolları üçün optional-auth ilə inactive/draft məhsulları görmə dəstəyi əlavə edildi.
- Backend-də çox vacib olan VENDOR rolu üçün ownership bug-ı (istifadəçi ID-si ilə satıcı ID-sinin müqayisəsi səbəbilə) aradan qaldırıldı. Satıcılar artıq öz məhsullarını yeniləyə və silə bilərlər.
- `server/src/tests/helpers/testHelpers.ts` yeniləndi: VENDOR rolunda yaradılan test istifadəçiləri üçün avtomatik olaraq Vendor profili yaradılması təmin olundu.
- `server/src/tests/product.test.ts` daxilinə `vendorId` və `isActive` filtrləri üçün testlər əlavə olundu.

### Yoxlama:
- `client npx tsc --noEmit` — uğurlu ✅
- `client npm run lint` — uğurlu ✅
- `client npm run test` — 37 fayl / 185 test uğurlu ✅
- `server npx tsc --noEmit` — uğurlu ✅
- `server npm run lint` — uğurlu ✅
- `server npx jest src/tests/product.test.ts` — 32/32 test uğurlu ✅

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
