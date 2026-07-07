# DEPLOYMENT.md — Deploy & CI/CD

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [ismetcahangirov/shopflow](https://github.com/ismetcahangirov/shopflow)  
> **Son yenilənmə:** 2026-06-04

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
│  Vercel (Next.js)    │   │  Vercel (Node/Express)       │
│  shopflow-theta      │   │  api-shopflow.vercel.app     │
│  .vercel.app         │   │  Serverless Functions        │
└──────────────────────┘   └──────────┬───────────────────┘
                                      │
                           ┌──────────▼───────────────────┐
                           │       PostgreSQL              │
                           │   (Supabase / Neon / etc.)   │
                           └──────────────────────────────┘
                                      │
                           ┌──────────▼───────────────────┐
                           │        Cloudinary            │
                           │    Media Storage + CDN       │
                           └──────────────────────────────┘
```

**Canlı URL-lər:**

| Servis | URL |
|---|---|
| Frontend | https://shopflow-theta.vercel.app |
| Backend API | https://api-shopflow.vercel.app |

---

## 2. Mühit Fərqləri

| Parametr | Development | Production |
|---|---|---|
| Frontend URL | `localhost:3000` | `https://shopflow-theta.vercel.app` |
| Backend URL | `localhost:5000` | `https://api-shopflow.vercel.app` |
| Database | Local PostgreSQL | Cloud PostgreSQL (Supabase/Neon) |
| NODE_ENV | `development` | `production` |
| HTTPS | Xeyr | Bəli (Vercel avtomatik) |
| Rate limit | Yumşaq | Ciddi |
| Logging | Console (debug) | Winston (warn+) |
| Stripe | Test keys | Live keys |

---

## 3. Supabase / PostgreSQL Qurulumu

```
1. supabase.com → "Start your project" → GitHub ilə giriş
2. "New Project" → Organization seç
3. Name: shopflow-prod
4. Database Password: [güclü şifrə — mütləq saxla]
5. Region: Frankfurt (eu-central-1)
6. "Create new project" → 2-3 dəqiqə gözlə

7. Settings → Database
   ├── Connection string → URI tab → kopyala
   │     postgresql://postgres:[şifrə]@db.[id].supabase.co:5432/postgres
   └── Direct connection (migration üçün):
         postgresql://postgres:[şifrə]@db.[id].supabase.co:5432/postgres

8. server/.env-ə əlavə et:
   DATABASE_URL="postgresql://postgres:..."
   DIRECT_URL="postgresql://postgres:..."
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

## 5. Vercel Qurulumu — Frontend (Next.js)

### 5.1 Vercel Dashboard

```
1. vercel.com → "New Project"
2. GitHub repo-nu import et → "ismetcahangirov/shopflow"
3. Root Directory: client
4. Framework Preset: Next.js (avtomatik aşkarlanır)
5. Environment Variables əlavə et (aşağıdakı siyahı)
6. "Deploy"
```

### 5.2 `client/vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "outputDirectory": ".next",
  "regions": ["fra1"],
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
  ]
}
```

### 5.3 Frontend Environment Variables (Vercel Panel)

```env
NEXT_PUBLIC_API_URL=https://api-shopflow.vercel.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_google_client_id
NEXT_PUBLIC_SITE_URL=https://shopflow-theta.vercel.app
```

---

## 6. Vercel Qurulumu — Backend (Express.js)

### 6.1 Necə işləyir?

Express.js Vercel-də **Serverless Function** kimi işləyir.  
`server/api/index.ts` faylı Express `app`-ı export edir, `server/vercel.json` isə bütün sorğuları bu fayla yönləndirir.

```
server/
  api/
    index.ts        ← Vercel entry point (app-ı export edir)
  src/
    server.ts       ← Express app (app listenin xaricindədir)
  vercel.json       ← Route konfiqurasiyası
```

### 6.2 Vercel Dashboard

```
1. vercel.com → "New Project"
2. GitHub repo-nu import et → "ismetcahangirov/shopflow"
3. Root Directory: server
4. Framework Preset: Other
5. Build Command: npm run build
6. Output Directory: dist
7. Install Command: npm ci
8. Environment Variables əlavə et (aşağıdakı siyahı)
9. "Deploy"
```

### 6.3 `server/vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ]
}
```

### 6.4 Backend Environment Variables (Vercel Panel)

```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://postgres:[şifrə]@db.[id].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[şifrə]@db.[id].supabase.co:5432/postgres

# JWT — minimum 64 simvol
JWT_SECRET=<64+ simvol random string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<başqa 64+ simvol random string>
JWT_REFRESH_EXPIRES_IN=7d

# CORS — frontend URL
CLIENT_URL=https://shopflow-theta.vercel.app
# Əlavə icazəli origin-lər (vergüllə) — yeni custom/production domen üçün.
# Kodu dəyişmədən whitelist-ə domen əlavə etmək üçün istifadə et.
# CORS_EXTRA_ORIGINS=https://shopflow.az,https://www.shopflow.az
# Bu layihənin Vercel preview deploy-larına (shopflow-*.vercel.app) icazə: true|false
CORS_ALLOW_VERCEL_PREVIEWS=false

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
```

```bash
# 64 simvollu güclü secret yaratma:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6.5 Stripe Webhook Qurulumu

```
1. stripe.com → Developers → Webhooks → "Add endpoint"
2. Endpoint URL: https://api-shopflow.vercel.app/api/payments/webhook
3. Events seç:
   ├── payment_intent.succeeded
   ├── payment_intent.payment_failed
   └── charge.refunded
4. "Add endpoint"
5. "Signing secret" kopyala → STRIPE_WEBHOOK_SECRET
```

---

## 7. Production Migration

```bash
# İlk deploy zamanı (lokal maşından, production DB-yə):
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Seed data yalnız bir dəfə (ilk deploy):
DATABASE_URL="postgresql://..." npx prisma db seed

# Migrate status yoxlama:
DATABASE_URL="postgresql://..." npx prisma migrate status
```

> ⚠️ **Production-da heç vaxt `prisma migrate dev` işlətmə!**  
> Yalnız `prisma migrate deploy` — mövcud migrasiyaları tətbiq edir.

---

## 8. GitHub Actions CI/CD Pipeline

Fayl: `.github/workflows/ci.yml`

```
Pipeline mərhələləri:
  1. Lint         — backend + frontend ESLint
  2. Test Backend — PostgreSQL service container ilə Jest
  3. Test Frontend— Vitest coverage
  4. Security     — npm audit --audit-level=high
  5. Build        — tsc (backend) + next build (frontend)
  6. Notify       — Vercel auto-deploy URL-lərini log edir
```

**Vercel auto-deploy:** `main` branch-a hər push-da Vercel özü deploy edir.  
CI pipeline yalnız testləri keçirir — deploy üçün əlavə addım lazım deyil.

---

## 9. GitHub Secrets Siyahısı

`Repo → Settings → Secrets and variables → Actions`:

| Secret | Məzmun |
|---|---|
| `JWT_SECRET` | 64+ simvol random string |
| `JWT_REFRESH_SECRET` | Başqa 64+ simvol random string |
| `NEXT_PUBLIC_API_URL` | `https://api-shopflow.vercel.app/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` veya `pk_test_...` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## 10. Health Check Endpointi

```typescript
// src/routes/healthRoutes.ts
router.get('/health', async (req, res) => {
  // DB bağlantısını yoxla
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', db: 'connected', env: process.env.NODE_ENV });
});
```

Test:
```bash
curl https://api-shopflow.vercel.app/api/health
# → { "status": "ok", "db": "connected", "env": "production" }
```

---

## 11. Rollback Strategiyası

```bash
# Git ilə rollback
git revert <commit-hash>     # Geri al (yeni commit)
git push origin main         # Vercel avtomatik deploy edir

# Vercel Dashboard-dan:
# Project → Deployments → əvvəlki deployment → "..." → "Promote to Production"

# Database rollback:
# Prisma migrate-in geri alınması mümkün deyil — yalnız yeni migration yazılır
```

---

## 12. Deploy Sonrası Yoxlama Siyahısı

```
BACKEND
  [ ]  GET https://api-shopflow.vercel.app/api/health → { status: "ok" }
  [ ]  POST /api/auth/login → 200 OK
  [ ]  HTTPS aktiv (Vercel avtomatik)
  [ ]  CORS yalnız shopflow-theta.vercel.app üçün açıqdır
  [ ]  Rate limiting aktiv
  [ ]  X-Powered-By header yoxdur (Helmet)

FRONTEND
  [ ]  https://shopflow-theta.vercel.app açılır
  [ ]  Login işləyir
  [ ]  Google OAuth işləyir
  [ ]  Məhsullar yüklənir (API-dan)
  [ ]  Dil dəyişdirici işləyir (AZ/EN/RU)
  [ ]  Mobil görünüş düzgündür
  [ ]  /sitemap.xml əlçatandır
  [ ]  robots.txt düzgündür

ÖDƏNİŞ
  [ ]  Stripe test ödənişi işləyir
  [ ]  Webhook events Stripe dashboard-da görünür
  [ ]  Sifariş statusu ödənişdən sonra yenilənir

VERİLƏNLƏR BAZASI
  [ ]  DB bağlantısı aktiv (health check vasitəsilə)
  [ ]  Migration-lar tətbiq edilib
  [ ]  Seed data daxil edilib (admin hesabı mövcuddur)

TƏHLÜKƏSİZLİK
  [ ]  .env faylları GitHub-da görünmür
  [ ]  SSL sertifikat etibarlıdır (Vercel avtomatik)
  [ ]  npm audit --audit-level=high keçib
  [ ]  Stripe webhook imzası işləyir
  [ ]  Admin panel /admin → yalnız ADMIN rollu giriş edə bilir
```
