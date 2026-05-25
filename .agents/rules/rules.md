---
trigger: always_on
---

# rules.md — Layihə Qaydaları

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## PR və Test Qaydası

Hər mərhələni tamamladıqdan sonra, PR açmadan əvvəl mütləq aşağıdakı yoxlamaları icra et:

### 1. TypeScript Yoxlaması (Məcburi)

```bash
# Backend
cd server && npx tsc --noEmit

# Frontend
cd client && npx tsc --noEmit
```

### 2. Backend Testlər

```bash
cd server && npm run test
```

### 3. Frontend Testlər

```bash
cd client && npm run test
```

### 4. Lint Yoxlaması

```bash
cd server && npm run lint
cd client && npm run lint
```

### Şərtlər

- ✅ Bütün yoxlamalar keçirsə → PR aç
- ❌ Hər hansı yoxlama keçməzsə → Əvvəlcə xətaları düzəlt, sonra yenidən yoxla
- ⚠️ Bu qayda istisnasız hər mərhələyə aiddir

---

## TypeScript Qaydaları (Məcburi)

```
✅  Bütün funksiyalar, komponentlər, hook-lar TypeScript tipli olmalıdır
✅  Prisma-nın öz tiplərindən istifadə et (çıxarılan tiplər)
✅  Zod schema-larından TypeScript tipləri çıxar (z.infer<>)
✅  Interface-lər PascalCase olmalıdır
✅  req.user tipi express.d.ts-də genişləndirilmiş olmalıdır

❌  any tipi qadağandır (yalnız @ts-ignore ilə son çarə)
❌  Non-null assertion (!) yalnız Prisma-nın məcburi sahələrində
❌  Tip iddiası (as Type) yalnız zəruri hallarda
❌  TypeScript xətası olan kod commit-ə daxil edilmir
```

---

## Kod Qaydaları (Məcburi)

```
BACKEND
  ✅  Hər controller asyncHandler ilə sarılır — try/catch yoxdur
  ✅  Xətalar throw new AppError() ilə atılır
  ✅  Bütün cavablar successResponse() ilə göndərilir
  ✅  Prisma sorğularında select — yalnız lazım olan sahələr
  ✅  Route sırası: protect → authorize → validate → controller
  ✅  Stripe webhook route-u express.json()-dan əvvəl qeydiyyatdadır
  ✅  Mühit dəyişənlərinin mövcudluğu startup-da yoxlanır

  ❌  console.log commit-ə daxil edilmir (logger istifadə et)
  ❌  Hardcoded URL, şifrə, token
  ❌  Production DB-yə test məlumatı yazma
  ❌  Migration olmadan schema dəyişikliyi

FRONTEND
  ✅  'use client' yalnız zəruri hallarda (hook, event, browser API)
  ✅  next/image bütün şəkillər üçün (img tagi qadağandır)
  ✅  next/image-də sizes prop mütləq verilir
  ✅  LCP şəkili üçün priority={true}
  ✅  aspect-ratio container — layout shift yoxdur
  ✅  Skeleton bütün async məzmun üçün
  ✅  Bütün public text-lər next-intl ilə tərcümə olunur
  ✅  parseApiError() bütün API xətaları üçün

  ❌  localStorage birbaşa istifadəsi (Zustand persist istifadə et)
  ❌  useEffect ilə data fetch (TanStack Query istifadə et)
  ❌  Inline stil (Tailwind class istifadə et)
  ❌  any tipi komponent props-larında

I18N
  ✅  Yeni açar əvvəl az.json-a, sonra en.json, ru.json-a əlavə edilir
  ✅  Hər üç dildə açar mövcuddur
  ✅  Açar adları snake_case formatındadır

SEO
  ✅  Yeni public səhifədə generateMetadata() yazılır
  ✅  Yeni dinamik səhifədə hreflang alternates əlavə edilir
  ✅  Admin/vendor/cart/checkout səhifələrə robots noindex tətbiq edilir
```

---

## Test Qaydaları (Məcburi)

```
BACKEND
  ✅  Hər yeni API endpointi üçün ən az:
        • 1 uğurlu test (200/201)
        • 1 auth testi (401 — token yoxdur)
        • 1 rol testi (403 — icazəsiz rol)
        • 1 validasiya testi (400 — yanlış input)
        • 1 tapılmadı testi (404 — mövcud deyil)

  ✅  Test DB production DB-dən ayrıdır
  ✅  beforeEach cədvəlləri təmizlənir
  ✅  testHelpers.ts köməkçi funksiyaları istifadə edilir

  ❌  Production DB-yə test yazma (globalSetup yoxlayır)
  ❌  Testdə hardcoded ID-lər
  ❌  Testdə sleep() — async yoxlama istifadə et

FRONTEND
  ✅  Hər yeni komponent üçün ən az:
        • Render testi
        • Props dəyişikliyi testi
        • İstifadəçi interaksiyası testi (klik, input)
        • Boş/xəta vəziyyəti testi

  ✅  Zustand store-lar unit test edilir
  ✅  Mock-lar setup.ts-də mərkəzləşdirilir

  ❌  Snapshot testlər (köhnəlir tez)
  ❌  CSS class-larını test et (implementasiya deyil, davranış test et)
```

---

## Git Qaydaları (Məcburi)

```
✅  Hər branch bir tapşırıq/xüsusiyyət üçündür
✅  Branch həmişə main-dən açılır
✅  Commit mesajları Conventional Commits formatındadır
✅  PR açmadan əvvəl bütün yoxlamalar keçilir

❌  main-ə birbaşa push
❌  Başqa branch-dan branch açma
❌  PR birləşməmiş növbəti tapşırığa başlama
❌  "WIP", "fix", "update" kimi qeyri-mənalı commit mesajları
❌  Tamamlanmamış kod push etmə (draft PR istifadə et)
❌  .env faylını commit-ə daxil etmə
```

---

## Təhlükəsizlik Qaydaları (Məcburi)

```
✅  Hər yeni endpoint protect + authorize middleware ilə qorunur
✅  Stripe webhook imzası yoxlanır
✅  Fayl yükləmə tipi + ölçüsü yoxlanır
✅  Prisma parametrized queries istifadə edilir

❌  API key, şifrə, token kod içinə yazılmır
❌  req.body-dən gələn data birbaşa DB-yə yazılmır
❌  Xəta mesajında stack trace production-da göstərilmir
❌  JWT_SECRET 64 simvoldan az
```

---

## Prisma Qaydaları

```
✅  Schema dəyişikliyi → npx prisma migrate dev --name <ad>
✅  Migration sonra → npx prisma generate
✅  Production-da → npx prisma migrate deploy (migrate dev deyil!)
✅  Yeni model əlavə olunanda seed.ts yenilənir

❌  prisma migrate reset production-da
❌  $queryRawUnsafe istifadəsi
❌  Migration-ı manual SQL ilə bypass etmə
```

---

## AI Agent üçün Xüsusi Qeydlər

```
1.  Hər tapşırıqdan əvvəl WORKFLOW.md-dəki mərhələ cədvəlinə bax — **yalnız o cədvəldə göstərilən sənədləri** oxu, başqalarına toxunma
2.  TypeScript xətası varsa — düzəlt, PR açma
3.  Test keçməyirsə — düzəlt, PR açma
4.  Lint xətası varsa — düzəlt, PR açma
5.  Yeni I18N açarı əlavə edirsənsə — 3 dildə əlavə et
6.  Yeni API endpointi yaradırsansa — test yaz
7.  Yeni komponent yaradırsansa — test yaz
8.  Stripe webhook-a toxunursansa — express.raw() sırasını yoxla
9.  Prisma schema dəyişdirirsənsə — migrate dev işlət
10. TODO.md-i hər tapşırıqdan sonra yenilə
11. AI_AGENT_CONTEXT.md-i hər tapşırıqdan sonra yenilə — TODO.md ilə eyni commit-də
```

> ⚠️ 10 və 11-ci qaydalar MECBURİDİR — bu iki fayl yenilənmədən push etmə.
