# AI_AGENT_CONTEXT.md — ShopFlow
> Son yenilənmə: 2026-05-27

## Cari Vəziyyət

**Aktiv Branch:** `feature/m05-categories-frontend`  
**Cari Mərhələ:** Mərhələ 5.2 — Kateqoriyalar Frontend (Tamamlandı, PR üçün hazır)  
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

### Mərhələ 4 — Common UI Komponentləri ✅
- **Button:** 6 variant (default, outline, secondary, ghost, destructive, link), isLoading, icon dəstəyi, premium fokus ring.
- **Modal:** Portal-əsaslı, ESC + backdrop click, dinamik ölçü (sm→full), animasiyalı açılış/bağlanış.
- **Badge:** 6 variant, animasiyalı dot indikatoru, 3 ölçü.
- **Avatar:** `next/image` inteqrasiyalı, initials fallback, loading state, 5 ölçü.
- **Spinner:** Müxtəlif ölçü və variantlarda loading indikatoru.
- **Skeleton:** Pulse animasiyalı baza skeleton + `ProductCardSkeleton` + `ProductGridSkeleton`.
- **EmptyState:** Premium placeholder, icon, title, description, action slot.
- **ErrorState:** Retry callback, premium error UI.
- **ErrorBoundary:** Class-based crash recovery, hasError state, retry trigger.
- **Pagination:** Sibling ranges, ellipsis, info indicators (toplam, cari), `showInfo` prop.
- **ConfirmDialog:** Modal-əsaslı, primary/destructive/warning variantları.
- **Table + DataTable:** Type-safe, sortable sütunlar, checkbox seçimi, skeleton + empty state inteqrasiyası, row actions.
- **StatCard:** Dashboard kartı, trend yönü (+/-), colorTheme, icon slot.
- **PageHeader:** Title, description, breadcrumbs, actions.
- **SearchBar:** 300ms debounce, clear button, focus styling.
- **PriceRange:** İkili slider, aktiv track highlight, min/max value göstəricisi.

**Test nəticəsi:** 94/94 frontend testi ✅ | 21/21 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

### Mərhələ 5.1 — Kateqoriyalar Backend ✅
- **Ağac Strukturu (Tree Structure):** `GET /api/categories` endpointi ilə parent-child əlaqəli (2 dərəcəyə qədər alt kateqoriyalar daxil) bütün aktiv kateqoriyalar gətirilir.
- **Dinamik Slug:** `GET /api/categories/:slug` slug vasitəsilə tək kateqoriya, onun ana kateqoriyası və aktiv alt kateqoriyaları gətirilir.
- **Admin CRUD:** `POST`, `PUT`, `DELETE` endpointləri (protect + authorize middleware ilə qorunur) yaradıldı.
- **Validasiya:** `express-validator` və Zod tipləri əsasında mükəmməl təhlükəsizlik və yoxlama middleware-ləri quruldu.
- **Cloudinary İnteqrasiyası:** Multer (yaddaş yaddaşlı storage) + Cloudinary v2 SDK vasitəsilə şəklin növünü və ölçüsünü yoxlayaraq şəkil yükləmə mexanizmi quruldu.
- **İnteqrasiya Testləri:** Bütün hallar üçün 45/45 Jest testləri uğurla icra olundu.

**Test nəticəsi:** 94/94 frontend testi ✅ | 45/45 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

### Mərhələ 5.2 — Kateqoriyalar Frontend ✅
- **Navbar Dropdown:** `useCategoriesQuery` hook-u ilə dinamik kateqoriya siyahısı, hover flyout panel, alt kateqoriyaların görüntülənməsi.
- **Dinamik Kateqoriya Səhifəsi** (`/category/[slug]/page.tsx`):
  - SSG + `generateStaticParams()` bütün kateqoriyalar + locales kombinasiyası üçün.
  - `generateMetadata()` OpenGraph, hreflang alternates, canonical URL ilə tam SEO dəstəyi.
  - Premium hero bölümü (kateqoriya şəkli, adı, təsviri, məhsul sayı, breadcrumb).
  - Alt kateqoriyalar grid görünüşü (hover animasiyaları, şəkil, fallback icon).
  - Məhsullar bölümü EmptyState ilə placeholder (Mərhələ 6-da dinamikləşdiriləcək).
- **Admin Kateqoriya CRUD Paneli** (`/admin/categories/page.tsx`):
  - Axtarış + status filter (aktiv/qeyri-aktiv/hamısı).
  - Kateqoriya cədvəli — thumbnail, ad, parent/alt bilgisi, məhsul sayı, status toggle.
  - Modal form — yarat/redaktə et (ad, slug auto-generate, şəkil upload, parent seçimi, SEO accordion).
  - Cloudinary şəkil yükləmə + preview ilə tam inteqrasiya.
  - Silmə onayı (`ConfirmDialog`) ilə təhlükəsiz DELETE əməliyyatı.
- **Test Mühiti İyileştirməsi:**
  - `src/test/setup.ts`-ə `next/image` mock-u əlavə edildi (React.createElement vasitəsilə).
  - Avatar testi real `src` URL-i ilə yeniləndi.
- **Lint & TypeScript Təmizliyi:** Bütün unused imports (`useEffect`, `ChevronRight`, `ArrowRight`, `useTranslations`, `PageHeader`), unused variables (`t`, `isParent`, `isCategoriesLoading`) aradan qaldırıldı. `any` tipləri `Category` və `React.ImgHTMLAttributes<HTMLImageElement>` ilə əvəzləndi.

**Test nəticəsi:** 94/94 frontend testi ✅ | 45/45 backend testi ✅  
**TypeScript:** `npx tsc --noEmit` — 0 xəta ✅  
**Lint:** `npm run lint` — 0 xəbərdarlıq/xəta ✅

## Növbəti Addımlar

1. Bu branch üzrə PR açmaq və merge etmək.
2. Növbəti tapşırıq: **Mərhələ 6.1 — Məhsullar Backend** (`GET /api/products`, CRUD, Cloudinary çox şəkil yükləmə, filter/sort/pagination).

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
