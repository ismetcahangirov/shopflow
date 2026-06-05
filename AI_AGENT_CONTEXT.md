# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-06-05 (`/search` SSR səhifəsi əlavə edildi)  
> Cari mərhələ: **Mərhələ 6.2 tamamlandı, Mərhələ 19 (Deploy & CI/CD) davam edir**

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

## Son Agent Tapşırığı: Mərhələ 6.2 — Axtarış Səhifəsi

**Branch:** `feature/m06-search-page`

### Tamamlanan işlər:
- `client/src/app/[locale]/(shop)/search/page.tsx` yaradıldı: SSR məhsul axtarışı, `GET /api/products` inteqrasiyası, URL query-lərinə bağlı filtr/sort/pagination, error və empty state dəstəyi.
- `generateMetadata()` əlavə edildi: query əsaslı title/description, canonical və hreflang (`az/en/ru`) alternates.
- `ProductFilters` və `ProductGrid` mövcud komponentləri istifadə edildi; yeni public mətnlər `az.json`, `en.json`, `ru.json` fayllarına əlavə edildi.
- `client/src/app/[locale]/(shop)/search/SearchPage.test.tsx` yaradıldı: axtarış səhifəsinin müxtəlif vəziyyətləri (uğurlu axtarış, boş axtarış, API xətası, metadata generasiyası) üçün Vitest testləri yazıldı.
- `client/src/app/sitemap.ts` yeniləndi: hər 3 lokalizasiya üçün axtarış səhifəsinin dinamik URL-ləri sitemap-ə əlavə edildi.
- `docs/TODO.md` içində `Axtarış səhifəsi (/search/page.tsx — SSR)` tamamlandı kimi işarələndi.

### Yoxlama:
- `client npx.cmd tsc --noEmit` — uğurlu ✅
- `client npm.cmd run lint` — uğurlu ✅
- `client npm.cmd run test` — 37 fayl / 185 test uğurlu (o cümlədən yeni axtarış testi) ✅
- `server npx.cmd tsc --noEmit` — uğurlu ✅
- `server npm.cmd run lint` — uğurlu ✅
- `server npm.cmd run test` — uğurlu (sendEmail, address testləri lokal DB vasitəsilə verify edildi) ✅

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
