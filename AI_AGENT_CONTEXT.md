# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-05-27

## Cari Vəziyyət

**Aktiv Branch:** `feature/m03-layout`
**Cari Mərhələ:** Mərhələ 3 — Layout & Naviqasiya (Tamamlandı, PR gözləyir)
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
- **Root Layout:** LocaleProvider, fonts, responsive provider-lər və React Query client konfiqurasiya edildi.
- **Workspace Layouts:** 
  - `app/[locale]/(shop)/layout.tsx` (Premium Navbar & Footer)
  - `app/[locale]/admin/layout.tsx` (Rol əsaslı qoruma, AdminSidebar, mobil drawer və analitik dashboard mockup)
  - `app/[locale]/vendor/layout.tsx` (Satıcıya xas sidebar, balans və sifarişlər analitikası)
- **Responsive Naviqasiya:**
  - `Navbar` — Axtarış, səbət sayğacı, dil keçidi və rol əsaslı profil dropdown-u
  - `Footer` — Premium dizayn, sosial şəbəkələr və naviqasiya linkləri
  - `AdminSidebar` & `VendorSidebar` — Aktiv marşrutları vurğulayan panel naviqasiyası
  - `BottomTabs` — Mobil cihazlar üçün rola xas sürətli alt naviqasiya
- **SEO & i18n:**
  - `Breadcrumb` — Dinamik yol izi və SEO JSON-LD struktur dəstəyi
  - `LanguageSwitcher` — `az`, `en`, `ru` dilləri arasında problemsiz keçid
- **Lint & TypeScript Təmizliyi:** Bütün linter xəbərdarlıqları və unused imports aradan qaldırıldı.

**Test nəticəsi:** 29/29 frontend testi ✅ | 21/21 backend testi ✅
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

## Növbəti Addımlar

1. PR-i review et, `main`-ə merge et.
2. Növbəti tapşırıq: **Mərhələ 4 — Common UI Komponentləri** (Button, Input, Modal, DataTable, Badge, Avatar, Spinner və s.)

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
