---
description: 
---

# AI_AGENT_CONTEXT.md — Agent Kontekst Faylı

> **Layihə:** ShopFlow E-Commerce Platform
> **Bu fayl nədir:** AI agent hər söhbət başında bu faylı oxuyur — layihənin cari vəziyyətini, son PR-ı, növbəti tapşırığı burada tapır.
> **Kim yeniləyir:** Hər PR birləşdikdən sonra SAHİB bu faylı yeniləyir.

---

## 🔴 İndi haradayıq?

```
Cari mərhələ : Mərhələ 2.1 — Backend Auth (Tamamlandı)
Növbəti      : Mərhələ 2.2 — Frontend Auth Forms
Branch       : feature/m02-auth-backend (Tamamlanıb, PR gözləyir)
Bloklanma    : Yoxdur
```

---

## Son PR (ən son birləşən)

```
PR nömrəsi  : —
Branch      : feature/m02-auth-backend
Nə edildi   : Backend Auth endpointləri (register, login, logout, refresh-token, google OAuth, verify, password reset), rate limiters və validation tamamlandı. 21/21 integration testləri keçir.
Birləşmə    : —
```

---

## Növbəti tapşırıq — agent bunu götürür

```
Mərhələ     : Mərhələ 2.2 — Frontend Auth Forms
Branch adı  : feature/m02-auth-frontend
Sənəd       : AUTH.md, COMPONENTS.md
```

**Alt-tapşırıqlar:**
- [x] Zustand `authStore` yaradıldı (`src/store/authStore.ts`)
- [ ] Login səhifəsi yaradıldı (`app/[locale]/(auth)/login/page.tsx`)
- [ ] Register səhifəsi yaradıldı (`app/[locale]/(auth)/register/page.tsx`)
- [ ] Şifrəni unutdum səhifəsi yaradıldı
- [ ] Şifrə sıfırlama səhifəsi yaradıldı
- [ ] Email doğrulama səhifəsi yaradıldı
- [ ] Google OAuth düyməsi əlavə edildi (`@react-oauth/google`)
- [ ] Google OAuth inteqrasiyası tamamlandı
- [ ] Forma validasiyası (React Hook Form + Zod) tətbiq edildi
- [x] Token saxlama strategiyası (Zustand memory + httpOnly cookie)
- [x] Axios interceptor ilə auto token refresh tətbiq edildi
- [ ] `ProtectedRoute` komponenti yaradıldı
- [ ] Auth layout yaradıldı
- [ ] `useRole` hook yazıldı

---

## Layihə Mühiti

| Xidmət     | Status       | Qeyd                          |
|------------|--------------|-------------------------------|
| Supabase   | ✅ Qoşulub   | Tokyo region IPv4 connection pooler (port 6543) |
| Cloudinary | ⬜ Qurulmayıb | Şəkil saxlama                  |
| Resend     | ⬜ Qurulmayıb | Email göndərmə                 |
| Stripe     | ⬜ Qurulmayıb | Test modu — test key lazımdır  |
| Vercel     | ⬜ Deploy yox | Frontend host                  |
| Render     | ⬜ Deploy yox | Backend host                   |
| GitHub     | ⬜ Repo yox   | Repo yaradılmayıb              |

---

## Texnologiya Yığımı (xatırlatma)

| Tərəf    | Stack                                              |
|----------|----------------------------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind, Shadcn, Zustand  |
| Backend  | Node.js, Express, TypeScript, Prisma, PostgreSQL   |
| Auth     | JWT (access 15dəq + refresh 30gün), Google OAuth   |
| Ödəniş  | Stripe                                             |
| Email    | Resend                                             |
| Media    | Cloudinary                                         |
| i18n     | next-intl — AZ (default), EN, RU                   |

---

## Ümumi Tərəqqi

| Mərhələ               | Status        | Faiz  |
|-----------------------|---------------|-------|
| 0 — Sənədləşmə        | ✅ Tamamlandı  | 100%  |
| 1 — Qurulum           | ✅ Tamamlandı  | 100%  |
| 2 — Auth              | [~] Davam edir | 50%   |
| 3 — Layout            | ⬜ Gözləyir   | 0%    |
| 4 — Komponentlər      | ⬜ Gözləyir   | 0%    |
| 5 — Kateqoriyalar     | ⬜ Gözləyir   | 0%    |
| 6 — Məhsullar         | ⬜ Gözləyir   | 0%    |
| 7 — Səbət             | ⬜ Gözləyir   | 0%    |
| 8 — Kuponlar          | ⬜ Gözləyir   | 0%    |
| 9 — Ünvanlar          | ⬜ Gözləyir   | 0%    |
| 10 — Ödəniş & Sifariş | ⬜ Gözləyir   | 0%    |
| 11 — İstək Siyahısı   | ⬜ Gözləyir   | 0%    |
| 12 — Rəylər           | ⬜ Gözləyir   | 0%    |
| 13 — Profil           | ⬜ Gözləyir   | 0%    |
| 14 — Vendor           | ⬜ Gözləyir   | 0%    |
| 15 — Analitika        | ⬜ Gözləyir   | 0%    |
| 16 — SEO & Performans | ⬜ Gözləyir   | 0%    |
| 17 — Testlər          | ⬜ Gözləyir   | 0%    |
| 18 — Təhlükəsizlik    | ⬜ Gözləyir   | 0%    |
| 19 — Deploy           | ⬜ Gözləyir   | 0%    |

---

## Agent üçün İlk Əmr Şablonu

Yeni söhbət başladıqda agentə bu formatda əmr ver:

```
AI_AGENT_CONTEXT.md-ə və TODO.md-ə bax.
Növbəti tapşırığı götür, yeni branch aç, tamamla, push et.
Bitdikdə mənə xəbər ver.
```

---

## AI AGENT ÜÇÜN — Yeniləmə Qaydası

**Bu faylı AI agent özü yeniləyir** — sahib yox.

### Nə vaxt yenilənir?

Hər tapşırıq tamamlanıb push edilmədən əvvəl bu faylı yenilə:

```
1. `🔴 İndi haradayıq?` → yeni mərhələ + branch adı yaz
2. `Son PR` → tamamlanan branch, nə edildi
3. `Növbəti tapşırıq` → TODO.md-dəki növbəti `[ ]` bloku
4. `Layihə Mühiti` → yeni xidmət qurulubsa ⬜ → ✅
5. `Ümumi Tərəqqi` → tamamlanan mərhələni ✅-ə çevir, faizi yenilə
```

### Commit formatı

```bash
git add workflows/AI_AGENT_CONTEXT.md docs/TODO.md
git commit -m "docs(context): mərhələ X tamamlandı, kontekst yeniləndi"
```

> Bu fayl tapşırığın kod commit-i ilə **eyni commit-də** yenilənir — ayrıca commit etmə.

---

> **Qeyd:** Bu fayl layihənin "hazırkı vəziyyəti"dir.
> docs/TODO.md tapşırıqların tam siyahısıdır.
>  workflows/WORKFLOW.md agent iş axınıdır.
> Bu üçü birlikdə oxunur.
