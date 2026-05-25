# DEPLOYMENT.md — Deploy & CI/CD

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Ümumi Baxış

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Repository                     │
│              main branch-a push / PR merge              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               GitHub Actions CI/CD                      │
│   Lint → Test → Security Audit → Build → Deploy        │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│      FRONTEND        │   │           BACKEND            │
│  Vercel (Next.js)    │   │  Render (Node.js + Express)  │
│  Edge Network        │   │  Auto-deploy from GitHub     │
│  ISR + CDN           │   │  Health check: /api/health   │
└──────────────────────┘   └──────────┬───────────────────┘
                                      │
                           ┌──────────▼───────────────────┐
                           │         Supabase             │
                           │      PostgreSQL 16           │
                           │   (500MB pulsuz, limitsiz)   │
                           └──────────────────────────────┘
                                      │
                           ┌──────────▼───────────────────┐
                           │        Cloudinary            │
                           │    Media Storage + CDN       │
                           └──────────────────────────────┘
```

---

## 2. Mühit Fərqləri

| Parametr | Development | Production |
|---|---|---|
| Frontend URL | `localhost:3000` | `https://shopflow.az` |
| Backend URL | `localhost:5000` | `https://api.shopflow.az` |
| Database | Local PostgreSQL | Supabase (cloud) |
| NODE_ENV | `development` | `production` |
| HTTPS | Xeyr | Bəli (məcburi) |
| Rate limit | Yumşaq | Ciddi |
| Logging | Console (debug) | Winston (warn+) |
| Stripe | Test keys | Live keys |

---

## 3. Supabase Qurulumu

```
1. supabase.com → "Start your project" → GitHub ilə giriş
2. "New Project" → Organization seç
3. Name: shopflow-prod
4. Database Password: [güclü şifrə — mütləq saxla]
5. Region: Frankfurt (eu-central-1) — Render ilə yaxın
6. "Create new project" → 2-3 dəqiqə gözlə

7. Settings → Database
   ├── Connection string → URI tab → kopyala
   │     postgresql://postgres:[şifrə]@db.[id].supabase.co:5432/postgres
   └── Direct connection (migration üçün):
         postgresql://postgres:[şifrə]@db.[id].supabase.co:5432/postgres

8. server/.env-ə əlavə et:
   DATABASE_URL="postgresql://postgres:..."      ← PgBouncer (normal sorğular)
   DIRECT_URL="postgresql://postgres:..."        ← Direct (migration üçün)
```

---

## 4. Cloudinary Qurulumu

```
1. cloudinary.com → "Sign Up Free"
2. Dashboard-da aşağıdakıları al:
   ├── Cloud Name:  your_cloud_name
   ├── API Key:     123456789012345
   └── API Secret:  xxxxxxxxxxxxxxxxxxxxxxxxxxxx

3. Settings → Upload → Upload Presets
   → "Add upload preset"
   → Preset name: shopflow_products
   → Signing Mode: Signed
   → Folder: shopflow/products

4. server/.env-ə əlavə et:
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 5. Production Build

### 5.1 Frontend (Next.js)

```bash
cd client
npm ci
npm run build
# Çıxış: .next/ qovluğu
# Vercel avtomatik emal edir
```

**`next.config.ts` production parametrləri:**

```typescript
import type { NextConfig }    from 'next';
import createNextIntlPlugin    from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output:       'standalone',         // Docker üçün (opsional)
  compress:     true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);
```

### 5.2 Backend (Node.js + TypeScript)

```bash
cd server
npm ci --only=production
npm run build        # tsx → dist/ qovluğu
# və ya birbaşa
node --import=tsx/esm src/server.ts
```

**`package.json` scripts:**

```json
{
  "scripts": {
    "dev":     "tsx watch src/server.ts",
    "build":   "tsc --project tsconfig.build.json",
    "start":   "node dist/server.js",
    "test":    "jest --runInBand",
    "test:ci": "jest --runInBand --forceExit --coverage",
    "lint":    "eslint src --ext .ts"
  }
}
```

---

## 6. Environment Dəyişənləri — Production

### Frontend (`client` — Vercel panel)

```env
NEXT_PUBLIC_API_URL=https://api.shopflow.az/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_SITE_URL=https://shopflow.az
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_google_client_id
```

### Backend (`server` — Render panel)

```env
PORT=5000
NODE_ENV=production

# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:[şifrə]@db.[id].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[şifrə]@db.[id].supabase.co:5432/postgres

# JWT — minimum 64 simvol, fərqli olmalıdır
JWT_SECRET=<64+ simvol random string>
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=<başqa 64+ simvol random string>
JWT_REFRESH_EXPIRE=30d

# Resend Email
RESEND_API_KEY=re_live_...
EMAIL_FROM=noreply@shopflow.az

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe — LIVE açarlar (production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# CORS
CLIENT_URL=https://shopflow.az
```

```bash
# 64 simvollu güclü secret yaratma:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 7. Vercel Qurulumu (Frontend)

### 7.1 Əsas Qurulum

```bash
# Vercel CLI
npm install -g vercel
cd client
vercel --prod
```

**Və ya GitHub inteqrasiyası ilə:**
```
1. vercel.com → "New Project"
2. GitHub repo-nu import et
3. Framework Preset: Next.js (avtomatik aşkarlanır)
4. Root Directory: client
5. Environment Variables əlavə et (yuxarıdakı siyahı)
6. "Deploy"
```

### 7.2 `vercel.json`

```json
{
  "buildCommand":    "npm run build",
  "outputDirectory": ".next",
  "installCommand":  "npm ci",
  "framework":       "nextjs",
  "regions":         ["fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options",        "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy",        "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/(admin|vendor)/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ],
  "rewrites": [
    {
      "source":      "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

### 7.3 Custom Domain (Vercel)

```
1. Vercel → Project → Settings → Domains
2. "Add Domain" → shopflow.az
3. DNS provayderinizdə:
   ├── A record:     shopflow.az    → 76.76.21.21
   └── CNAME record: www.shopflow.az → cname.vercel-dns.com
4. SSL sertifikat avtomatik verilir (Let's Encrypt)
```

---

## 8. Render Qurulumu (Backend)

### 8.1 `render.yaml`

```yaml
services:
  - type:   web
    name:   shopflow-api
    env:    node
    region: frankfurt
    plan:   starter

    buildCommand: |
      cd server &&
      npm ci --only=production &&
      npm run build &&
      npx prisma migrate deploy

    startCommand: cd server && node dist/server.js

    healthCheckPath: /api/health
    healthCheckTimeout: 10

    autoDeploy: true

    envVars:
      - key:   NODE_ENV
        value: production
      - key:   CLIENT_URL
        value: https://shopflow.az
      - key:   DATABASE_URL
        sync:  false
      - key:   DIRECT_URL
        sync:  false
      - key:   JWT_SECRET
        sync:  false
      - key:   JWT_REFRESH_SECRET
        sync:  false
      - key:   STRIPE_SECRET_KEY
        sync:  false
      - key:   STRIPE_WEBHOOK_SECRET
        sync:  false
      - key:   CLOUDINARY_API_SECRET
        sync:  false
      - key:   RESEND_API_KEY
        sync:  false
```

### 8.2 Render Manual Qurulum

```
1. render.com → "New" → "Web Service"
2. GitHub repo-nu bağla
3. Name:    shopflow-api
4. Region:  Frankfurt
5. Branch:  main
6. Build Command:
   cd server && npm ci --only=production && npm run build && npx prisma migrate deploy
7. Start Command:
   cd server && node dist/server.js
8. Environment Variables əlavə et (yuxarıdakı siyahı)
9. Health Check Path: /api/health
10. "Create Web Service"
```

### 8.3 Custom Domain (Render)

```
1. Render → Service → Settings → Custom Domains
2. "Add Custom Domain" → api.shopflow.az
3. DNS provayderinizdə:
   CNAME record: api.shopflow.az → shopflow-api.onrender.com
4. SSL sertifikat avtomatik (30 saniyə)
```

### 8.4 Stripe Webhook Qurulumu

```
1. stripe.com → Developers → Webhooks → "Add endpoint"
2. Endpoint URL: https://api.shopflow.az/api/payments/webhook
3. Events seç:
   ├── payment_intent.succeeded
   ├── payment_intent.payment_failed
   └── charge.refunded
4. "Add endpoint"
5. "Signing secret" kopyala → STRIPE_WEBHOOK_SECRET
```

---

## 9. GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:

  # ── 1. LINT ────────────────────────────────────────────────
  lint:
    name: 🔍 Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - name: Backend lint
        run: cd server && npm ci && npm run lint
      - name: Frontend lint
        run: cd client && npm ci && npm run lint

  # ── 2. BACKEND TEST ────────────────────────────────────────
  test-backend:
    name: 🧪 Backend Tests
    runs-on: ubuntu-latest
    needs: lint

    services:
      postgres:
        image:   postgres:16
        env:
          POSTGRES_USER:     postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB:       shopflow_test
        ports:   ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }

      - name: Backend testlər
        run: cd server && npm ci && npm run test:ci
        env:
          NODE_ENV:           test
          DATABASE_URL:       postgresql://postgres:postgres@localhost:5432/shopflow_test
          DIRECT_URL:         postgresql://postgres:postgres@localhost:5432/shopflow_test
          JWT_SECRET:         ${{ secrets.JWT_SECRET }}
          JWT_REFRESH_SECRET: ${{ secrets.JWT_REFRESH_SECRET }}

      - name: Coverage upload
        uses: codecov/codecov-action@v4
        with:
          directory: ./server/coverage

  # ── 3. FRONTEND TEST ───────────────────────────────────────
  test-frontend:
    name: 🧪 Frontend Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - name: Frontend testlər
        run: cd client && npm ci && npm run test:coverage
        env:
          NEXT_PUBLIC_API_URL: http://localhost:5000/api

  # ── 4. TƏHLÜKƏSİZLİK AUDIT ────────────────────────────────
  security:
    name: 🔒 Security Audit
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Backend audit
        run: cd server && npm ci && npm audit --audit-level=high
      - name: Frontend audit
        run: cd client && npm ci && npm audit --audit-level=high

  # ── 5. BUILD ───────────────────────────────────────────────
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend, security]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }

      - name: Frontend build
        run: cd client && npm ci && npm run build
        env:
          NEXT_PUBLIC_API_URL:                ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:  ${{ secrets.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME }}
          NEXT_PUBLIC_SITE_URL:               https://shopflow.az

      - name: Backend build
        run: cd server && npm ci && npm run build

  # ── 6. DEPLOY ──────────────────────────────────────────────
  deploy:
    name: 🚀 Deploy
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy Backend (Render)
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}" \
            -H "Content-Type: application/json"

      # Vercel GitHub inteqrasiyası ilə avtomatik deploy edilir
      # Frontend üçün əlavə addım lazım deyil

      - name: Deploy bildirişi
        run: |
          echo "✅ Deploy tamamlandı!"
          echo "Frontend: https://shopflow.az"
          echo "Backend:  https://api.shopflow.az"
```

---

## 10. GitHub Secrets Siyahısı

`Repo → Settings → Secrets and variables → Actions`:

| Secret | Məzmun |
|---|---|
| `JWT_SECRET` | 64+ simvol random string |
| `JWT_REFRESH_SECRET` | Başqa 64+ simvol random string |
| `NEXT_PUBLIC_API_URL` | `https://api.shopflow.az/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud adı |
| `RENDER_DEPLOY_HOOK` | Render → Deploy hook URL |

---

## 11. Production Migration

```bash
# CI/CD-də build command içindədir:
npx prisma migrate deploy

# Manual (Render shell-dən):
npx prisma migrate deploy

# Seed data yalnız bir dəfə (ilk deploy):
npx prisma db seed

# Prisma Studio — Supabase-ə bağlan (lokal maşından):
DATABASE_URL="postgresql://..." npx prisma studio
```

> ⚠️ **Production-da heç vaxt `prisma migrate dev` işlətmə!**  
> Yalnız `prisma migrate deploy` — mövcud migrasiyaları tətbiq edir.

---

## 12. Health Check Endpointi

```typescript
// src/routes/healthRoutes.ts

import { Router }   from 'express';
import { prisma }   from '../config/db';

const router = Router();

router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status:    isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
    db:        dbStatus,
    env:       process.env.NODE_ENV,
    version:   process.env.npm_package_version ?? '1.0.0',
  });
});

export default router;
```

---

## 13. Rollback Strategiyası

```bash
# Git ilə rollback
git log --oneline -10             # Son commit-ləri gör
git revert <commit-hash>          # Geri al (yeni commit)
git push origin main

# Render-də:
# Dashboard → Deploys → əvvəlki deploy → "Rollback to this deploy"

# Database rollback (Prisma):
# Prisma migrate-in geri alınması mümkün deyil — yalnız yeni migration
# Supabase Pro-da PITR (Point-in-Time Recovery) mövcuddur

# Stripe webhook rollback:
# Stripe Dashboard-dan webhook endpoint-i deaktiv et
# Köhnə version deploy ediləndən sonra yenidən aktiv et
```

---

## 14. Deploy Sonrası Yoxlama Siyahısı

```
BACKEND
  [ ]  GET https://api.shopflow.az/api/health → { status: "ok", db: "connected" }
  [ ]  POST /api/auth/login → 200 OK
  [ ]  HTTPS aktiv: https://api.shopflow.az
  [ ]  HTTP → HTTPS yönləndirməsi işləyir
  [ ]  CORS yalnız shopflow.az üçün açıqdır
  [ ]  Rate limiting aktiv
  [ ]  X-Powered-By header yoxdur

FRONTEND
  [ ]  https://shopflow.az açılır
  [ ]  Login işləyir
  [ ]  Google OAuth işləyir
  [ ]  Məhsullar yüklənir
  [ ]  Dil dəyişdirici işləyir (AZ/EN/RU)
  [ ]  Mobil görünüş düzgündür
  [ ]  Sitemap əlçatandır: /sitemap.xml
  [ ]  robots.txt düzgündür

ÖDƏNİŞ
  [ ]  Stripe test ödənişi işləyir
  [ ]  Webhook events Stripe dashboard-da görünür
  [ ]  Sifariş statusu ödənişdən sonra yenilənir

VERİLƏNLƏR BAZASI
  [ ]  Supabase bağlantısı aktiv
  [ ]  Migration-lar tətbiq edilib (prisma migrate status)
  [ ]  Seed data daxil edilib (admin hesabı mövcuddur)

TƏHLÜKƏSİZLİK
  [ ]  .env faylları GitHub-da görünmür
  [ ]  SSL sertifikat etibarlıdır (hər iki domain)
  [ ]  npm audit --audit-level=high keçib
  [ ]  Stripe webhook imzası işləyir (test event göndər)
  [ ]  Admin panel /admin → yalnız ADMIN rollu giriş edə bilir
```
