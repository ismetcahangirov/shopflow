# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-05-25

## Cari Vəziyyət

**Aktiv Branch:** `chore/m01-frontend-setup`
**Cari Mərhələ:** 1.2 — Frontend Setup (Tamamlandı) & 2.2 — Frontend Auth Foundation (Başlanıldı)
**Status:** Tamamlandı, PR gözləyir

## Tamamlanan Mərhələlər

### Mərhələ 0 — Sənədləşmə ✅
- Bütün sənədlər (`README.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md` və s.) hazırlandı.

### Mərhələ 1.1 — Backend Setup ✅
- Express, TypeScript, Prisma, Winston, Rate limiting və s. təməl qurulumlar bitib.

### Mərhələ 1.2 — Frontend Setup ✅
- Next.js 14 layihəsi `client/` qovluğunda quruldu.
- **Dizayn Sistemi & Stil:** Tailwind CSS xüsusi rəng palitrası və animasiyalarla tənzimləndi. Shadcn/ui və `cn()` utility quraşdırıldı.
- **İnfrastruktur:** TanStack Query v5 `Providers.tsx` vasitəsilə inteqrasiya edildi, auto-refresh interceptors daxil Axios `api.ts` hazırlandı.
- **i18n:** `next-intl` ilə çoxdilli marşrutlaşdırma (`az`, `en`, `ru`) və qorunan marşrutlar üçün `middleware.ts` təyin edildi.
- **Validasiya & Tiplər:** `shared/schemas/auth.ts` Zod sxemləri və `src/types/index.ts` vahid TypeScript tipləri yaradıldı.
- **Təhlükəsizlik & State:** Zustand `authStore.ts` ilə təhlükəsiz in-memory access token və cookie userRole sinxronizasiyası quruldu.
- **Test:** Vitest + React Testing Library + jsdom konfiqurasiya edilib `@vitest/coverage-v8` ilə 80% limit tətbiq olundu. `authStore.test.ts` testləri 100% uğurla keçdi.

## Növbəti Addımlar

1. Sahibin PR-i review edib merge etməsini gözlə.
2. PR merge olunduqdan sonra: **Mərhələ 2.1 — Backend Auth & 2.2 — Frontend Auth Forms** başla.
   - Branch: `feature/m02-auth-backend` və `feature/m02-auth-frontend`

## Əsas Texniki Qərarlar

| Qərar | Səbəb |
|---|---|
| Zustand persisted metadata | İstifadəçi məlumatlarını səhifə yenilənəndə saxlamaq üçün (localStorage persist), lakin JWT token təhlükəsizliyi üçün in-memory `__accessToken` |
| next-intl + Custom Route middleware.ts | Localization routing-i təmin etmək və qorunan səhifələrə (Checkout, Admin, Vendor) girişi süzgəcdən keçirmək üçün |
| Vitest component test mühiti | Jest-ə nisbətən Next.js ESM dəstəyi və daha sürətli icra müddəti üçün |
| Vahid Zod sxemləri | Frontend və backend arasında validasiya kodunu eyni saxlayaraq xəta ehtimalını minimuma endirmək |

## Vacib Qeydlər

- Vitest testlərini icra etmək üçün: `npm run test` (client/ daxilində)
- Bütün testlər və lint yoxlamaları PR açılmadan əvvəl 100% yaşıl olmalıdır (`rules.md` tələbi).
