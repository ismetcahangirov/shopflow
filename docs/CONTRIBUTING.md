# CONTRIBUTING.md — Töhfə Qaydaları

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Başlamadan Əvvəl

### Zəruri Alətlər

| Alət | Versiya | Yüklə |
|---|---|---|
| Node.js | 20+ | nodejs.org |
| npm | 10+ | Node ilə gəlir |
| Git | 2.40+ | git-scm.com |
| PostgreSQL | 16+ (lokal) | postgresql.org |
| VS Code | Son | code.visualstudio.com |

### Tövsiyə Olunan VS Code Genişlənmələri

```
ESLint                    — TypeScript lint xətalarını real vaxtda gör
Prettier                  — Avtomatik kod formatlaması
Tailwind CSS IntelliSense — Tailwind sinifləri üçün autocomplete
TypeScript Hero           — Import optimallaşması
Prisma                    — Schema syntax highlight + format
GitLens                   — Git tarixini görüntülə
Thunder Client            — API test (Postman alternativ)
```

**`.vscode/settings.json`:**

```json
{
  "editor.formatOnSave":    true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint":    true,
    "source.organizeImports":  true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["clsx\\(([^)]*)\\)", "'([^']*)'"]
  ],
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

---

## 2. Layihəni Lokal Qur

```bash
# 1. Repo-nu fork et (GitHub-da "Fork" düyməsi)

# 2. Klonla
git clone https://github.com/SƏNIN_USERNAME/shopflow.git
cd shopflow

# 3. Upstream-i əlavə et
git remote add upstream https://github.com/your-username/shopflow.git

# 4. Backend qur
cd server
npm install
cp .env.example .env
# .env faylını doldur

# PostgreSQL test DB yarat
psql -U postgres -c "CREATE DATABASE shopflow_dev;"
psql -U postgres -c "CREATE DATABASE shopflow_test;"

# Migration-ları tətbiq et
npx prisma migrate dev
npx prisma db seed     # Test data

# 5. Frontend qur
cd ../client
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# 6. Hər ikisini başlat
# Terminal 1 — Backend:
cd server && npm run dev   # localhost:5000

# Terminal 2 — Frontend:
cd client && npm run dev   # localhost:3000

# 7. Prisma Studio (opsional — DB-ni vizual gör)
cd server && npx prisma studio   # localhost:5555
```

---

## 3. Branch Strategiyası

```
main
  └── develop
        ├── feature/product-filters
        ├── feature/stripe-payment
        ├── bugfix/cart-quantity-update
        ├── hotfix/auth-token-refresh
        └── chore/update-prisma-schema
```

| Branch növü | Prefiks | Nümunə |
|---|---|---|
| Yeni xüsusiyyət | `feature/` | `feature/vendor-dashboard` |
| Xəta düzəltmə | `bugfix/` | `bugfix/product-slug-duplicate` |
| Kritik düzəltmə | `hotfix/` | `hotfix/stripe-webhook-signature` |
| Texniki iş | `chore/` | `chore/update-prisma-5` |
| Sənədləşmə | `docs/` | `docs/api-payment-endpoints` |
| Refactoring | `refactor/` | `refactor/cart-store-zustand` |
| Test | `test/` | `test/product-integration-tests` |

### Branch Qaydaları

```bash
# Həmişə develop-dan yeni branch aç
git checkout develop
git pull upstream develop
git checkout -b feature/yeni-xususiyyet

# İş bitdikdən sonra
git add .
git commit -m "feat(product): məhsul filter sistemi əlavə edildi"
git push origin feature/yeni-xususiyyet

# GitHub-da PR aç: feature/... → develop
```

---

## 4. Commit Mesajı Formatı

**Conventional Commits** standartına uyğun:

```
<növ>(<əhatə>): <qısa təsvir>

[opsional: ətraflı açıqlama]

[opsional: BREAKING CHANGE və ya issue ref]
```

### Növlər

| Növ | Nə vaxt | Nümunə |
|---|---|---|
| `feat` | Yeni xüsusiyyət | `feat(auth): google oauth əlavə edildi` |
| `fix` | Xəta düzəltmə | `fix(cart): miqdar artırma xətası düzəldildi` |
| `docs` | Sənədləşmə | `docs(api): payment endpointləri əlavə edildi` |
| `style` | Formatlaşdırma | `style: prettier formatlaması tətbiq edildi` |
| `refactor` | Yenidən strukturlaşdırma | `refactor(auth): authStore zustand-a köçürüldü` |
| `test` | Test əlavəsi | `test(products): integration testlər əlavə edildi` |
| `chore` | Build, paket, konfiq | `chore: prisma 5-ə yüksəldildi` |
| `perf` | Performans | `perf(products): məhsul siyahısı cache edildi` |
| `ci` | CI/CD | `ci: github actions pipeline əlavə edildi` |
| `revert` | Geri alma | `revert: feat(auth) - google oauth geri alındı` |

### Nümunələr

```bash
# Yaxşı commit mesajları
git commit -m "feat(products): məhsul filter və sıralama əlavə edildi"
git commit -m "fix(auth): refresh token expire xətası düzəldildi"
git commit -m "feat(payment): stripe webhook inteqrasiyası tamamlandı"
git commit -m "test(orders): sifariş yaratma integration testləri"
git commit -m "chore(deps): @stripe/stripe-js 3.0.0-a yüksəldildi"
git commit -m "docs(deployment): render qurulum qaydaları əlavə edildi"
git commit -m "perf(images): next/image blur placeholder əlavə edildi"

# Pis commit mesajları
git commit -m "düzəltdim"           # Nəyi?
git commit -m "update"              # Nə yeniləndi?
git commit -m "fix bug"             # Hansı bug?
git commit -m "WIP"                 # Tamamlanmamış iş push olunmasın
git commit -m "asdfgh"              # Mənasız
```

---

## 5. Kod Standartları

### 5.1 TypeScript Qaydaları

```typescript
// ── TİP ADLANDIRMA ────────────────────────────────────────
// Interface — PascalCase
interface ProductCard {
  id:    string;
  name:  string;
  price: number;
}

// Type alias — PascalCase
type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

// Enum — PascalCase (yalnız gerçəkdən enum lazım olduqda)
// Prisma enum-ları istifadə et, öz enum-larından qaçın

// ── DƏYİŞƏN ADLANDIRMA ───────────────────────────────────
const userName      = 'ali';          // camelCase
const MAX_RETRIES   = 3;              // UPPER_SNAKE_CASE (sabit)
const UserCard      = () => {};       // PascalCase (komponent)
const useAuth       = () => {};       // camelCase (hook: use + ...)
const formatPrice   = () => {};       // camelCase (utility)

// ── TİP GENİŞLƏNDİRMƏ ───────────────────────────────────
// Yaxşı
const user = await prisma.user.findUnique({
  where:  { id },
  select: { id: true, name: true, email: true },
});
// user tipi Prisma tərəfindən çıxarılır — any yoxdur

// Pis
const user: any = await prisma.user.findUnique({ where: { id } });

// ── OPTIONAL CHAINING ────────────────────────────────────
// Yaxşı
const avatar = user?.avatar ?? '/default.png';
const name   = product?.vendor?.storeName ?? 'ShopFlow';

// Pis
const avatar = user && user.avatar ? user.avatar : '/default.png';

// ── ASYNC/AWAIT ───────────────────────────────────────────
// Yaxşı — asyncHandler ilə (try/catch olmadan)
export const getProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });
    if (!product) throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');
    successResponse(res, { data: product });
  }
);

// Pis — hər yerdə try/catch
export const getProduct = async (req: Request, res: Response) => {
  try {
    // ...
  } catch (err) {
    res.status(500).json({ error: 'Xəta' });
  }
};
```

### 5.2 React / Next.js Qaydaları

```typescript
// ── SERVER vs CLIENT COMPONENT ───────────────────────────
// 'use client' — yalnız zəruri hallarda:
// ✅ useState, useEffect, useCallback, useMemo
// ✅ Event handler-lər (onClick, onChange)
// ✅ Browser API (localStorage, window)
// ✅ Zustand store-lardan oxuma
// ❌ Yalnız props render etmək üçün

// ── KOMPONENT STRUKTURU ───────────────────────────────────
// Yaxşı — aydın, TypeScript tipli
interface ProductCardProps {
  product:      Product;
  priority?:    boolean;
  showWishlist?: boolean;
}

export default function ProductCard({
  product,
  priority     = false,
  showWishlist = true,
}: ProductCardProps) {
  const { isCustomer } = useRole();
  const t              = useTranslations('product');

  return (
    <div className="...">
      {/* ... */}
    </div>
  );
}

// ── IMPORT SIRASI ─────────────────────────────────────────
// 1. React
import { useState, useEffect, useCallback } from 'react';
// 2. Next.js
import Image    from 'next/image';
import Link     from 'next/link';
import { useRouter } from 'next/navigation';
// 3. Üçüncü tərəf
import { useTranslations } from 'next-intl';
import { Heart, ShoppingCart } from 'lucide-react';
// 4. Internal — stores
import { useCartStore }   from '@/store/cartStore';
// 5. Internal — hooks
import { useRole }        from '@/hooks/useRole';
// 6. Internal — components
import Button             from '@/components/common/Button';
import { StarRating }     from '@/components/shop/StarRating';
// 7. Internal — utils/types
import { formatPrice }    from '@/utils/formatPrice';
import type { Product }   from '@/types/product.types';
```

### 5.3 Backend Qaydaları (TypeScript)

```typescript
// ── CONTROLLER STRUKTURU ──────────────────────────────────
// Hər controller: asyncHandler + AppError + successResponse
// try/catch YOX — asyncHandler tutur

export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page  = '1',
      limit = '20',
      sort  = 'createdAt_desc',
    } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where:   { isActive: true },
        include: { images: { take: 1, where: { isMain: true } } },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    successResponse(res, {
      data:       products,
      pagination: { page: pageNum, limit: limitNum, total,
                    pages: Math.ceil(total / limitNum) },
    });
  }
);

// ── PRISMA SORĞULARI ─────────────────────────────────────
// Yaxşı — yalnız lazım olan sahələri seç
await prisma.user.findMany({
  select: { id: true, name: true, email: true, role: true },
  where:  { isActive: true },
});

// Pis — bütün sahələri çək
await prisma.user.findMany({ where: { isActive: true } });

// ── ROUTE KONFIQURASIYASI ─────────────────────────────────
// Public → Auth → Role → Validation → Controller
router.post(
  '/',
  protect,                      // JWT yoxla
  authorize('ADMIN', 'VENDOR'), // Rol yoxla
  createProductValidation,      // Input yoxla
  validate,                     // Xəta formatla
  createProduct                 // İş məntiqi
);
```

### 5.4 Fayl Adlandırma Qaydaları

```
Frontend (client/src/):
  Komponent:    PascalCase  → ProductCard.tsx
  Hook:         camelCase   → useCart.ts
  Store:        camelCase   → cartStore.ts
  Utility:      camelCase   → formatPrice.ts
  Type:         camelCase   → product.types.ts
  Test:         eyni ad     → ProductCard.test.tsx
  Page:         page.tsx    → products/page.tsx
  Layout:       layout.tsx  → (shop)/layout.tsx

Backend (server/src/):
  Controller:   camelCase   → productController.ts
  Route:        camelCase   → productRoutes.ts
  Middleware:   camelCase   → authMiddleware.ts
  Utility:      camelCase   → asyncHandler.ts
  Config:       camelCase   → corsOptions.ts
  Test:         eyni ad     → products.test.ts
```

---

## 6. ESLint & Prettier Konfiqurasiyası

### `client/.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars":    ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any":   "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "no-console":                           ["warn", { "allow": ["warn", "error"] }],
    "prefer-const":                         "error",
    "react/self-closing-comp":              "warn",
    "react/jsx-curly-brace-presence":       ["warn", "never"],
    "@next/next/no-img-element":            "error"
  }
}
```

### `server/.eslintrc.json`

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "env": { "node": true, "es2021": true },
  "rules": {
    "@typescript-eslint/no-unused-vars":  ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console":                         "off",
    "prefer-const":                       "error",
    "no-var":                             "error"
  }
}
```

### `.prettierrc` (hər iki layihə üçün)

```json
{
  "semi":            true,
  "singleQuote":     true,
  "tabWidth":        2,
  "trailingComma":   "es5",
  "printWidth":      100,
  "bracketSpacing":  true,
  "arrowParens":     "always",
  "endOfLine":       "lf",
  "plugins":         ["prettier-plugin-tailwindcss"]
}
```

---

## 7. Pull Request Prosesi

### PR Açmadan Əvvəl

```bash
# 1. Upstream-dən son dəyişiklikləri al
git fetch upstream
git rebase upstream/develop

# 2. TypeScript yoxla
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit

# 3. Testlər keçir
cd server && npm run test
cd client && npm run test

# 4. Lint yoxla
cd server && npm run lint
cd client && npm run lint

# 5. Frontend build yoxla
cd client && npm run build
```

### PR Şablonu

```markdown
## Nə dəyişdirildi?
<!-- Əlavə edilən, dəyişdirilən xüsusiyyətlər -->

## Niyə?
<!-- Bu dəyişikliyin səbəbi -->

## Necə test edildi?
- [ ] Backend unit/integration testlər keçir
- [ ] Frontend komponent testlər keçir
- [ ] API manual test edildi (Thunder Client)
- [ ] UI brauzer(lərdə) test edildi
- [ ] Mobil görünüş yoxlandı
- [ ] TypeScript xətası yoxdur (`npx tsc --noEmit`)

## Screenshot (UI dəyişikliyi varsa)
<!-- Əvvəl / Sonra -->

## Əlaqəli Issue
Closes #<issue-nömrəsi>

## Yoxlama siyahısı
- [ ] Conventional Commits formatında commit mesajları
- [ ] Bütün CI yoxlamaları keçir
- [ ] `any` tipi istifadə edilməyib
- [ ] `console.log` commitə daxil edilməyib
- [ ] Yeni API endpointi üçün test yazılıb
- [ ] Yeni məhsul xüsusiyyəti üçün I18N açarları 3 dildə əlavə edilib
```

### PR Qaydaları

```
✅  Hər PR — tək bir xüsusiyyət və ya düzəltmə
✅  PR başlığı Conventional Commits formatında
✅  Bütün CI yoxlamaları keçsin
✅  TypeScript xətası olmayan kod
✅  Testlər yazılsın (yeni feature üçün)
✅  Screenshots (UI dəyişikliyi üçün)
❌  500+ sətir dəyişiklik olan böyük PR-lar açma — bölüşdür
❌  "WIP" PR-larını draft kimi aç
❌  Testlər olmadan yeni feature PR-ı açma
❌  `any` tipini qoyub PR açma
```

---

## 8. Kod Review Qaydaları

### Reviewer olaraq

```
✅  Konstruktiv rəy ver — niyəsini izah et
✅  Kiçik məsələlər üçün "nit:" prefiksi
✅  Yaxşı işi qiymətləndir
✅  Suallar ver, ittiham etmə
✅  48 saat içində review et
❌  Şəxsiləşdirmə
❌  "Bu yanlışdır" demə — alternativ göstər
```

### Nümunə Review Şərhləri

```typescript
// ── Blocker (birləşmə dayandırılır) ─────────────────────
// "Bu endpoint-də authMiddleware yoxdur — istənilən
//  istifadəçi admin əməliyyatı edə bilər."

// ── Suggestion (birləşməni bloklamır) ───────────────────
// "nit: Bu funksiya productUtils.ts-ə köçürülə bilər —
//  daha aydın olardı. Sənin seçimdir."

// ── TypeScript spesifik ──────────────────────────────────
// "Burada any yerinə Prisma-nın öz tipini istifadə et:
//  Prisma.UserFindUniqueArgs"

// ── Performans ────────────────────────────────────────────
// "Bu sorğuda .include({ user: true }) bütün user sahələrini
//  gətirir. .select({ user: { select: { id, name } } })
//  daha effektivdir."

// ── Qiymətləndirmə ───────────────────────────────────────
// "Çox səliqəli TypeScript tipi! Bu pattern-i
//  bütün controller-lərə tətbiq edə bilərik."
```

---

## 9. Versiya Nömrələmə

**Semantic Versioning (SemVer):** `MAJOR.MINOR.PATCH`

| Dəyişiklik | Versiya | Nümunə |
|---|---|---|
| Breaking change | MAJOR artır | `1.0.0 → 2.0.0` |
| Yeni xüsusiyyət | MINOR artır | `1.0.0 → 1.1.0` |
| Bug fix | PATCH artır | `1.0.0 → 1.0.1` |

```bash
# Release tag yaratma
git tag -a v1.1.0 -m "feat: vendor dashboard əlavə edildi"
git push origin v1.1.0
```

---

## 10. Sürətli Keçid

| Ehtiyac | Fayl |
|---|---|
| Yeni API endpointi | `API.md` → `server/src/routes/` → `server/src/controllers/` |
| Yeni səhifə | `ARCHITECTURE.md` → `client/src/app/[locale]/` |
| Yeni komponent | `COMPONENTS.md` → `client/src/components/` |
| Yeni tərcümə açarı | `I18N.md` → `i18n/az.json`, `en.json`, `ru.json` |
| Xəta idarəsi | `ERROR_HANDLING.md` |
| Test yazmaq | `TESTING.md` |
| Deploy etmək | `DEPLOYMENT.md` |
| SEO metadata | `SEO.md` |
| Ödəniş | `PAYMENT.md` |
| Şəkil yükləmə | `MEDIA.md` |
| İcazə yoxlamaq | `ROLES_PERMISSIONS.md` |
| DB schema dəyişmək | `DATABASE.md` → `prisma/schema.prisma` → `npx prisma migrate dev` |
| TODO yeniləmək | `TODO.md` |
