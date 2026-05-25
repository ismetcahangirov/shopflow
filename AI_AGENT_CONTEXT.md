# AI_AGENT_CONTEXT.md — ShopFlow

> Son yenilənmə: 2026-05-25

## Cari Vəziyyət

**Aktiv Branch:** `chore/m01-backend-setup`
**Cari Mərhələ:** 1.1 — Backend Setup
**Status:** Tamamlandı, PR gözləyir

## Tamamlanan Mərhələlər

### Mərhələ 0 — Sənədləşmə ✅
- Branch: `docs/m00-documentation` → main-ə merge edildi (PR #1)
- Bütün sənədlər (`README.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `AUTH.md`, `SECURITY.md`, `ERROR_HANDLING.md`, `TESTING.md`, `ROLES_PERMISSIONS.md`, `COMPONENTS.md`, `I18N.md`, `DEPLOYMENT.md`, `PAYMENT.md`, `MEDIA.md`, `SEO.md`, `CONTRIBUTING.md`, `TODO.md`, `WORKFLOW.md`, `rules.md`) hazırlandı

### Mərhələ 1.1 — Backend Setup ✅
- Branch: `chore/m01-backend-setup`
- **Yaradılan fayllar:**
  - `server/package.json` — bütün dependencies (express, prisma, stripe, resend, cloudinary, bcryptjs, jsonwebtoken, winston, zod, multer, cors, helmet, morgan, express-rate-limit, express-validator)
  - `server/tsconfig.json` — strict TypeScript config
  - `server/.eslintrc.json` — TypeScript ESLint rules
  - `server/.prettierrc` — code formatting
  - `server/.env.example` — bütün env variables sənədləşdirildi
  - `server/.gitignore`
  - `server/jest.config.ts` — ts-jest, 80% coverage threshold
  - `server/src/config/env.ts` — Zod ilə startup env validation
  - `server/src/config/db.ts` — Prisma Client singleton
  - `server/src/config/logger.ts` — Winston structured logger
  - `server/src/config/corsOptions.ts` — CORS strict whitelist
  - `server/src/utils/AppError.ts` — Custom error class
  - `server/src/utils/asyncHandler.ts` — try/catch wrapper
  - `server/src/utils/apiResponse.ts` — standardized response helpers
  - `server/src/utils/slugify.ts` — Azerbaijani char normalization
  - `server/src/types/express.d.ts` — req.user type augmentation
  - `server/src/middleware/errorMiddleware.ts` — global error handler
  - `server/src/middleware/rateLimiter.ts` — 3 rate limit configs
  - `server/src/controllers/healthController.ts` — DB health check
  - `server/src/routes/healthRoutes.ts`
  - `server/src/server.ts` — Express entry point
  - `server/prisma/schema.prisma` — full DB schema (15 models)
  - `server/prisma/seed.ts` — admin/vendor/customer/categories/products/coupons/settings

## Növbəti Addımlar

1. Sahibin PR-i review edib merge etməsini gözlə
2. PR merge olunduqdan sonra: **Mərhələ 1.2 — Frontend Setup** başla
   - Branch: `chore/m01-frontend-setup`
   - Next.js 14 + TypeScript + Tailwind + Shadcn/ui + Zustand + TanStack Query + next-intl

## Əsas Texniki Qərarlar

| Qərar | Səbəb |
|---|---|
| `env.ts` Zod validation | Startup-da fail fast — eksik env var production-da səssiz problem yaratmasın |
| Prisma global singleton | Hot reload zamanı çoxlu connection pool açılmasın |
| `asyncHandler` wrapper | Controller-lərdə try/catch olmasın — DRY principle |
| 3 ayrı rate limiter | API (100/15dəq), Auth (10/15dəq), Password reset (5/saat) — layihəyə uyğun fərqli limitlər |
| `directUrl` Prisma schema | Supabase PgBouncer migration-ı blokladığı üçün |
| Winston JSON logs production | Structured logging — log aggregation tools (Datadog, Logtail) ilə uyğun |

## Vacib Qeydlər

- **Stripe webhook route** `express.json()`-dan əvvəl qeydiyyata alınmalıdır (Mərhələ 10-da)
- **Migration** yalnız `npx prisma migrate dev` ilə, production-da `migrate deploy`
- **Seed data** hazır: admin@shopflow.az / Admin@1234
- `server/.env` faylı lazımdır — `.env.example`-dan kopyala, real dəyərləri doldur
