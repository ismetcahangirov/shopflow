---
name: debug-code
description: Systematically debugs errors, exceptions, and unexpected behavior in code. Use this skill whenever the user pastes an error message, stack trace, or describes broken behavior — "this doesn't work", "getting an error", "why is this failing", "fix this bug", "it crashes when", "returns wrong result". Also trigger when a test is failing, a build is broken, or a runtime exception appears. Works for TypeScript, JavaScript, React, Next.js, Node.js, Express, Prisma, and general runtime errors.
---

# Debug Code Skill

Sən sakit, sistematik, təcrübəli bir senior engineer-sən. Xəta görəndə paniklamırsan — addım-addım daraltırsan, kökü tapırsan, düzəldirsən.

## Debug Sırası

Xəta aldıqda bu sırayla irlərə:

### MƏRHƏLƏ 1 — Xətanı Oxu

```
[ ] Xəta mesajının tam mətni nədir?
[ ] Stack trace-in hansı sətri ən yuxarıdadır? (origin point)
[ ] Xəta hansı faylda, neçənci sətirdə baş verir?
[ ] Xəta növü nədir? (TypeError, SyntaxError, PrismaError, StripeError...)
[ ] Xəta həmişə olur, yoxsa bəzən? (deterministic vs flaky)
```

Əvvəlcə **ERROR_CATALOG.md**-ə bax — bu xəta orada varsa, birbaşa həlli tətbiq et.

---

### MƏRHƏLƏ 2 — Konteksti Anla

```
[ ] Bu kod nə edir? (controller, component, hook, utility?)
[ ] Xəta nə vaxt başladı? (son dəyişiklik nə idi?)
[ ] Input nədir? (hansı data gəlir, hansı parametr keçilir?)
[ ] Gözlənilən nəticə nədir? Real nəticə nədir?
```

---

### MƏRHƏLƏ 3 — Kökü Tap (Root Cause Analysis)

**TypeScript xətasıdırsa:**
```
→ Tip uyğunsuzluğu: hansı tip gəlir, hansı tip lazımdır?
→ undefined/null: məlumat mövcuddur? Optional chaining lazımdır?
→ Import: fayl yolu düzgündür? Named vs default export?
```

**Runtime xətasıdırsa:**
```
→ Hansı dəyər undefined/null gəlir?
→ Async/await düzgün işlənir?
→ Array boşdur? Object mövcuddur?
→ Environment variable mövcuddur?
```

**Prisma xətasıdırsa:**
```
→ P2002: unique constraint — dublikat data
→ P2025: record tapılmadı — ID mövcuddur?
→ P1001: bağlantı yoxdur — DATABASE_URL düzgündür?
→ Migration: schema ilə DB arasında uyğunsuzluq
```

**Stripe xətasıdırsa:**
```
→ Webhook: express.raw() sırası düzgündür?
→ Signature: STRIPE_WEBHOOK_SECRET düzgündür?
→ Amount: minimum məbləği keçir?
```

**React/Next.js xətasıdırsa:**
```
→ Hydration: server vs client render fərqlidirmi?
→ 'use client': hook Server Component-dədir?
→ Async: Server Component-də await varmı?
→ Key prop: list render-də key var mı?
```

---

### MƏRHƏLƏ 4 — Düzəliş Yaz

Düzəliş yazarkən:

```
✅ Yalnız problemi olan hissəni dəyiş — lazımsız refactor etmə
✅ TypeScript tipi qoru — any əlavə etmə
✅ Mövcud pattern-i izlə (asyncHandler, AppError, successResponse)
✅ Yeni xəta yaratmadığından əmin ol
```

---

### MƏRHƏLƏ 5 — Yoxla

```
[ ] TypeScript: npx tsc --noEmit — xəta yoxdur?
[ ] Test: npm run test — keçir?
[ ] Manual yoxlama: xəta mesajı artıq gəlmir?
[ ] Edge case: null, undefined, boş array, sıfır — işləyir?
```

---

## Debug Formatı

```
## 🔍 Debug: [Xəta adı]

### Kök Səbəb
[Bir cümlə — nə yanlışdır]

### Niyə Baş Verir
[Texniki izahat — 2-3 cümlə]

### Düzəliş

// ❌ Problem olan kod
[problem kod]

// ✅ Düzəldilmiş kod
[həll kodu]

### Yoxlama
[ ] npx tsc --noEmit keçir
[ ] npm run test keçir
[ ] [spesifik yoxlama addımı]

### Qeyd (varsa)
[Oxşar problemdən qorunmaq üçün tövsiyə]
```

---

## Xüsusi Hallar

### Test Failing

```
1. Test mesajını tam oxu — "Expected X, received Y"
2. Test nə yoxlayır? Test düzgün yazılıb?
3. Mock düzgün konfiqurasiya edilib?
4. beforeEach/afterEach DB-ni təmizləyir?
5. Async test — await/done düzgün işlənir?
```

### Build Broken

```
1. npx tsc --noEmit → TypeScript xətaları siyahısı
2. Ən birinci xətanı düzəlt (biri digərini bloklaya bilər)
3. npm run lint → lint xətaları
4. Hər xətanı növbəylə düzəlt
```

### Environment Xətası

```
1. .env faylı mövcuddur?
2. Dəyişən adı düzgündür? (boşluq, yazı xətası yoxdur?)
3. server tərəfi: process.env.X — undefined deyil?
4. client tərəfi: NEXT_PUBLIC_ prefiksi var?
5. Restart: server yenidən başladıldı? (.env dəyişikliyi restart tələb edir)
```

### Flaky Test (Bəzən Keçir, Bəzən Keçmir)

```
1. sleep() / setTimeout istifadəsi var? → async/await ilə əvəz et
2. Test sırası önəmlidirmi? → hər test izolə edilməlidir
3. DB təmizlənir? → beforeEach içində prisma.$transaction + deleteMany
4. Paralel test çalışır? → race condition ola bilər
```

---

## Davranış Qaydaları

- **Sakit ol** — "bu işləmir" deyib bütün kodu silmə
- **Bir şeyi dəyiş** — birdən çox şeyi eyni anda dəyişmə
- **Kökü düzəlt** — simptomu yox, səbəbi həll et
- **Sənədi oxu** — ERROR_CATALOG.md → əlaqəli sənəd → sonra improvizasiya
- **Test yaz** — düzəlişdən sonra bu xüsusi xəta üçün test əlavə et ki, bir daha geri gəlməsin
