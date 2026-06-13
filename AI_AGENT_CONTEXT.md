# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-06-13 (Admin Vendorlar Paneli əlavə edildi)  
> Cari mərhələ: **Mərhələ 14 (Vendor) tamamlandı, Mərhələ 13 (Profil) növbəlidir**


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

## Son Agent Tapşırığı: Mərhələ 14 (Tamamlama) — Admin Vendor İdarəetmə Paneli

**Branch:** `feature/m14-admin-vendors-panel`

### Tamamlanan işlər:
- **i18n Dəstəyi:** Satıcıların idarə edilməsi panelinin bütün ifadələri 3 dildə (`az.json`, `en.json`, `ru.json`) `admin_vendors` namespace-inə əlavə edildi.
- **useVendor Hooks:** Adminlər üçün vendor siyahısını almaq (`useAdminVendors`) və vendor statusunu yeniləmək (`useUpdateVendorStatus`) üçün yeni query/mutation hook-ları yazıldı.
- **Frontend Admin Vendors Page:** `client/src/app/[locale]/admin/vendors/page.tsx` səhifəsi yaradıldı. Bu səhifədə vendor müraciətləri siyahı formatında, status filtri və axtarışla göstərilir. Admin müraciətləri təsdiqləyə, rədd edə və ya dayandıra bilər. Həmçinin status dəyişikliyi zamanı qeyd (note) əlavə etmək üçün xüsusi təsdiq pəncərəsi quruldu.
- **Testlər:** `AdminVendorsPage.test.tsx` daxilinə vendor idarəetmə səhifəsinin bütün funksionallıqlarını (render, axtarış, filtr, təsdiq/rədd əməliyyatları, confirm modal) yoxlayan testlər yazıldı və bütün testlər uğurla keçdi.
- **TypeScript + Lint:** Bütün TS və Lint xətaları tam olaraq həll edildi.

### Yoxlama:
- `server` və `client` üzərində `npx tsc --noEmit` — Uğurlu ✅
- `server` və `client` üzərində `npm run lint` — Uğurlu ✅
- `npm run test` (client tərəfdə) — Bütün testlər keçdi (213 client testləri) ✅


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
