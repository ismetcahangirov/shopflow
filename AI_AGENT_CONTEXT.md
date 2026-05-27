# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-05-27

## Cari Vəziyyət

**Aktiv Branch:** `feature/m02-auth-frontend`
**Cari Mərhələ:** 2.2 — Frontend Auth Forms (Tamamlandı, PR gözləyir)
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

### Mərhələ 2.1 — Backend Auth ✅
- Bütün auth endpointləri, middleware-lər, validasiyalar tamamlandı. 21/21 test 100% yaşıl.

### Mərhələ 2.2 — Frontend Auth Forms ✅
**Branch:** `feature/m02-auth-frontend`

Yaradılan fayllar:
- `src/components/ui/input.tsx` — Password toggle, leading icon, error state
- `src/components/ui/label.tsx` — Accessible label with required indicator
- `src/components/ui/form-field.tsx` — Label + Input + animated error wrapper
- `src/components/auth/GoogleAuthButton.tsx` — GIS script-based Google OAuth
- `src/components/auth/AuthDivider.tsx` — "or" separator
- `src/hooks/useAuth.ts` — TanStack Query mutations (login, register, forgot/reset password, verify)
- `src/app/[locale]/(auth)/layout.tsx` — Premium split-screen auth layout
- `src/app/[locale]/(auth)/login/page.tsx` — Login form + post-register/reset banners
- `src/app/[locale]/(auth)/register/page.tsx` — Register form with CUSTOMER/VENDOR role selector
- `src/app/[locale]/(auth)/forgot-password/page.tsx` — Email form + success state
- `src/app/[locale]/(auth)/reset-password/page.tsx` — New password form + missing token guard
- `src/app/[locale]/(auth)/verify-email/page.tsx` — Auto-trigger token verification
- `src/app/[locale]/unauthorized/page.tsx` — Role-guard redirect page
- `client/.env.local` + `client/.env.example` — NEXT_PUBLIC env vars documented
- `src/components/ui/input.test.tsx` — 8 tests
- `src/components/ui/form-field.test.tsx` — 8 tests

**Test nəticəsi:** 22/22 test (6 authStore + 8 input + 8 form-field) ✅
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅
**Lint:** `next lint` — 0 xəbərdarlıq ✅

## Növbəti Addımlar

1. PR-i review et, `main`-ə merge et.
2. Növbəti tapşırıq: **Mərhələ 2.2 qalan** — `ProtectedRoute` komponenti, `useRole` hook
3. Sonra: **Mərhələ 3 — Layout & Naviqasiya** (Navbar, Footer, Shop layout)

## Əsas Texniki Qərarlar

| Qərar | Səbəb |
|---|---|
| GIS script (Google Identity Services) | `@react-oauth/google` package-ı olmadan Google OAuth — yeni npm asılılığı əlavə etmədən |
| Split-screen auth layout | Sol panel branding (indigo gradient), sağ panel form — premium UX |
| TanStack Query mutations | `useAuth` hook-ları — loading/error state avtomatik idarə olunur |
| Zustand persisted metadata | Token in-memory (təhlükəsiz), user metadata localStorage-da |
| next-intl + middleware.ts | Localization + role-based route qoruması eyni yerdə |

## Vacib Qeydlər

- Client env: `client/.env.local` — `NEXT_PUBLIC_API_URL` və `NEXT_PUBLIC_GOOGLE_CLIENT_ID` lazımdır
- Server env: `server/.env` — `GOOGLE_CLIENT_ID` və `GOOGLE_CLIENT_SECRET` lazımdır
- Google OAuth: GIS script `accounts.google.com/gsi/client` — Next.js `Script` komponenti ilə lazy yüklənir
- Vitest testləri: `cd client && npm run test`
- TypeScript yoxlaması: `cd client && npx tsc --noEmit`
