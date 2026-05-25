---
name: safe-code-check
description: Checks whether new or changed code will break existing functionality — analyzes side effects, API contract changes, database schema impacts, shared state mutations, import/export changes, and TypeScript type breakages before they reach production. Use this skill whenever the user asks "will this break anything?", "is it safe to add this?", "can I change this without breaking other things?", "what will be affected if I change X?", "safe to merge?", "impact analysis", or shows a diff/change and wants to know the risks. Also trigger when user is about to change a shared utility, a database schema, a Prisma model, a Zustand store, an API endpoint contract, a shared TypeScript type, or a middleware — these are high-impact changes that need careful checking. Trigger proactively when you see potentially breaking changes even if the user doesn't explicitly ask.
---

# Safe Code Check Skill

Yeni kod əlavə olunmadan və ya dəyişdirilmədən əvvəl — bu dəyişiklik mövcud funksionallığı pozacaqmı? Hər bucaqdan yoxla.

## Yoxlama Sırası

### MƏRHƏLƏ 1 — Dəyişikliyin Növünü Müəyyən Et

Əvvəlcə nə dəyişdirildiyini anla:

```
[ ] API endpoint kontraktı (URL, method, request/response format)
[ ] Prisma schema (model, sahə, münasibət, index)
[ ] Paylaşılan TypeScript type/interface
[ ] Zustand store strukturu
[ ] Utility/helper funksiya
[ ] Middleware (express, Next.js)
[ ] Stripe webhook handler
[ ] Authentication/Authorization məntiqi
[ ] Environment dəyişəni
[ ] npm paketi versiyası
[ ] Database migration
[ ] Import/export dəyişikliyi
```

Növə görə yoxlama intensivliyi dəyişir.

---

### MƏRHƏLƏ 2 — Birbaşa Təsirlər (Direct Impact)

**Funksiya/metod dəyişibsə:**
- Parametr sayı dəyişib? → Bütün çağırış yerləri tapılmalı
- Parametr tipi dəyişib? → TypeScript compile xətası verər
- Return tipi dəyişib? → İstifadəçi kodları dağıla bilər
- Davranış dəyişib? → Gizli bug yarana bilər

**TypeScript interface/type dəyişibsə:**
- `shared/schemas/` — həm frontend həm backend istifadə edir
- Yeni məcburi sahə əlavə edilib? → Köhnə kodlar TypeScript xətası verir
- Sahə silinib? → İstifadəçi kodları compile olmaz
- Tip genişlənib? → Adətən təhlükəsizdir
- Tip daralıb? → İstifadəçi kodları `never` ala bilər

**Prisma schema dəyişibsə:**
```
[ ] Yeni məcburi sahə → mövcud data null olacaq
[ ] Sahə adı dəyişib → bütün .field reference-lər qırılır
[ ] Münasibət dəyişib → cascade davranışı dəyişə bilər
[ ] Enum dəyər silinib → mövcud DB datası invalid olur
[ ] Index silinib → sorğular yavaşlaya bilər
[ ] @unique əlavə edilib → mövcud duplikat data migration-ı bloklaya bilər
```

---

### MƏRHƏLƏ 3 — Dolayı Təsirlər (Indirect Impact)

**API kontraktı dəyişibsə:**

| Dəyişiklik | Risk | Nə qırılır |
|---|---|---|
| URL dəyişib | 🔴 Yüksək | Frontend-in bütün API çağırışları |
| HTTP method dəyişib | 🔴 Yüksək | Frontend calls, Postman tests |
| Request body sahəsi silinib | 🔴 Yüksək | Frontend-in göndərdiyi data rədd edilir |
| Request body sahəsi əlavə edilib (məcburi) | 🟠 Orta | Köhnə frontend calls validation xətası alır |
| Response strukturu dəyişib | 🟠 Orta | Frontend-in `.data.field` access-ləri |
| Yeni endpoint əlavə edilib | 🟢 Aşağı | Adətən təhlükəsiz |
| Error response formatı dəyişib | 🟡 Orta | `parseApiError()` funksiyası |

**Zustand store dəyişibsə:**
```typescript
// Əgər store strukturu dəyişibsə:
// 1. persist middleware-i olan store-lar localStorage-da köhnə data saxlayır
// 2. İstifadəçinin brauzerində yanlış tip data ola bilər
// 3. Hydration mismatch baş verə bilər
// → Versiyonlaşdırma lazımdır: migrate: (state) => ({...})
```

**Middleware dəyişibsə:**
```
[ ] authMiddleware dəyişib → bütün protected route-lar təsirlənir
[ ] roleMiddleware dəyişib → bütün authorize() çağırışları
[ ] errorMiddleware dəyişib → bütün xəta formatları dəyişir
[ ] rateLimiter dəyişib → API limit davranışı dəyişir
[ ] Stripe webhook route sırası dəyişib → webhook daima fail ola bilər
```

**Next.js middleware dəyişibsə:**
```
[ ] matcher pattern dəyişib → hansı route-lar təsirlənir?
[ ] Redirect məntiqi dəyişib → redirect loop ola bilərmi?
[ ] Cookie adı dəyişib → auth state sıfırlanır
```

---

### MƏRHƏLƏ 4 — Database Təhlükəsizliyi

Prisma migration lazım olan hər dəyişiklik üçün:

```
TƏHLÜKƏSIZ (data itmir):
  ✅ Yeni opsional sahə əlavə et (@default() ilə)
  ✅ Yeni cədvəl əlavə et
  ✅ Index əlavə et
  ✅ @unique sil (məhdudiyyəti azaldır)

QISMƏN TƏHLÜKƏLİ (data dəyişir):
  ⚠️  Sahə tipini dəyiş → mövcud data migrate edilməlidir
  ⚠️  Sahə adını dəyiş → bütün referanslar yenilənməlidir
  ⚠️  @unique əlavə et → duplikat mövcud data migration-ı bloklayır
  ⚠️  @default() dəyərini dəyiş → yalnız yeni recordlara təsir

TƏHLÜKƏLİ (data itə bilər):
  🔴 Sahəni sil → data itir, foreign key qırıla bilər
  🔴 Cədvəli sil → bütün data itir, cascade silinmə
  🔴 NOT NULL əlavə et (default olmadan) → mövcud null data migration xətası
  🔴 Enum dəyər sil → mövcud data invalid olur
```

---

### MƏRHƏLƏ 5 — Stripe Webhook Xüsusi Yoxlaması

Ödəniş kodu dəyişibsə mütləq yoxla:

```
[ ] /api/payments/webhook route-u hələ express.raw() ƏVVƏL qeydiyyatdadır?
[ ] Webhook imza yoxlaması hələ aktivdir?
[ ] handlePaymentSuccess transaction-ı atomikdir (prisma.$transaction)?
[ ] Email göndərmə transaction-dan KƏNARDA qalır?
[ ] İdempotency yoxlaması hələ var? (PAID sifarişi ikinci dəfə emal etmə)
```

---

### MƏRHƏLƏ 6 — TypeScript Kompilyasiya Yoxlaması

```bash
# Backend
cd server && npx tsc --noEmit

# Frontend
cd client && npx tsc --noEmit
```

TypeScript xətası olmayan dəyişiklik = bu baxımdan təhlükəsiz.  
Amma TypeScript-in görmədiyi runtime problemlər ola bilər.

---

### MƏRHƏLƏ 7 — Test Örtüyü Yoxlaması

```
[ ] Dəyişdirilən kod üçün test var?
[ ] Mövcud testlər hələ keçəcəkmi?
[ ] Yeni test yazmaq lazımdır?

Yüksək risk: test olmayan kritik yol dəyişikliyi
Orta risk:   test olan amma edge case-lər örtülməyən
Aşağı risk:  tam test örtüyü olan dəyişiklik
```

---

## Hesabat Formatı

```
## 🛡️ Təhlükəsizlik Yoxlaması: [Dəyişikliyin adı]

### Dəyişiklik Növü
[Nə dəyişdirildi]

---

### 🔴 QIRILACAQ ŞEYLƏR (Dərhal Düzəlt)
[Yoxdursa: "Kritik problem tapılmadı ✅"]

**Problem:** [nə qırılır]
**Harada:** [fayl/funksiya]
**Necə düzəltmək:**
\`\`\`typescript
[düzəliş kodu]
\`\`\`

---

### 🟠 DİQQƏT TƏLƏB EDƏNLƏR (Yoxla)
[Nəzərə alınmalı yan təsirlər]

---

### 🟢 TƏHLÜKƏSİZ TƏRƏFLƏR
[Nə problem yaratmayacaq]

---

### 📋 Əlavə Addımlar (lazım olsa)
[ ] `npx prisma migrate dev --name ...` icra et
[ ] `npx prisma generate` icra et
[ ] Frontend-in bu endpointi yenilə: [hansı fayl]
[ ] I18N açarı əlavə et: [hansı açar]
[ ] Yeni test yaz: [hansı funksionallıq üçün]
[ ] Stripe Dashboard-da webhook-u yenilə

---

### ✅ Yekun Qərar
🟢 TƏHLÜKƏSİZ — deploy edə bilərsən
🟡 ŞƏRTLİ — yuxarıdakı addımları tamamla, sonra deploy et
🔴 TƏHLÜKƏLİ — kritik problemlər var, deploy etmə
```

---

## Yüksək Risk Siqnalları

Bu dəyişikliklər görünəndə avtomatik daha dərin yoxla:

```
🚨  shared/ qovluğunda dəyişiklik
🚨  prisma/schema.prisma dəyişikliyi
🚨  authMiddleware.ts dəyişikliyi
🚨  src/types/ dəyişikliyi
🚨  src/store/authStore.ts dəyişikliyi
🚨  paymentController.ts dəyişikliyi
🚨  server.ts middleware sırası dəyişikliyi
🚨  next.config.ts dəyişikliyi
🚨  middleware.ts (Next.js root) dəyişikliyi
🚨  package.json major versiya yüksəltmə
```

---

## Xüsusi Hal: Utility Funksiya Dəyişikliyi

`formatPrice`, `slugify`, `parseApiError` kimi paylaşılan utility dəyişibsə:

```
1. Bütün import yerləri tap (global axtarış)
2. Hər istifadə yerini yoxla — yeni davranışla uyğunmu?
3. Edge case-lər: null, undefined, boş string, sıfır, mənfi ədəd
4. TypeScript tipi dəyişibsə — bütün çağırış yerlərini yoxla
```
