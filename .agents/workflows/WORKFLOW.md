---
description: 
---

# WORKFLOW.md — AI Agent İş Axını

> **Layihə:** ShopFlow E-Commerce Platform
> **Qayda:** `1 tapşırıq = 1 branch = 1 PR`. Birbaşa main-ə push etmə.

---

## Addımlar

**1. TODO.md-i oxu** — ilk `[ ]` tapşırığı tap, mərhələsini müəyyən et, aşağıdakı cədvəldən yalnız həmin sənədləri oxu:

| Mərhələ | Oxunacaq sənədlər |
|---------|-------------------|
| **1** Backend | `ARCHITECTURE.md`, `DATABASE.md`, `ERROR_HANDLING.md`, `SEED_DATA.md` |
| **1** Frontend | `ARCHITECTURE.md`, `COMPONENTS.md` |
| **2** Auth | `AUTH.md`, `SECURITY.md`, `EMAIL_TEMPLATES.md`, `API.md` → `/auth` |
| **3** Layout | `COMPONENTS.md`, `I18N.md`, `ARCHITECTURE.md` → frontend |
| **4** Komponentlər | `COMPONENTS.md`, `ROLES_PERMISSIONS.md` |
| **5** Kateqoriyalar | `API.md` → `/categories`, `DATABASE.md` → `Category`, `SEO.md`, `MEDIA.md`, `I18N.md` |
| **6** Məhsullar | `API.md` → `/products`, `DATABASE.md` → `Product`, `SEO.md`, `MEDIA.md`, `I18N.md` |
| **7** Səbət | `API.md` → `/cart`, `DATABASE.md` → `Cart` |
| **8** Kuponlar | `API.md` → `/coupons`, `DATABASE.md` → `Coupon` |
| **9** Ünvanlar | `API.md` → `/addresses`, `DATABASE.md` → `Address` |
| **10** Ödəniş | `PAYMENT.md`, `API.md` → `/orders`+`/payments`, `DATABASE.md` → `Order`, `EMAIL_TEMPLATES.md` → sifariş |
| **11** İstək | `API.md` → `/wishlist`, `DATABASE.md` → `WishlistItem` |
| **12** Rəylər | `API.md` → `/reviews`, `DATABASE.md` → `Review` |
| **13** Profil | `API.md` → `/users`, `MEDIA.md`, `AUTH.md` → şifrə, `EMAIL_TEMPLATES.md` → şifrə |
| **14** Vendor | `API.md` → `/vendors`, `DATABASE.md` → `Vendor`, `ROLES_PERMISSIONS.md`, `MEDIA.md` |
| **15** Analitika | `API.md` → `/admin/analytics`, `ROLES_PERMISSIONS.md` → Admin |
| **16** SEO | `SEO.md`, `I18N.md`, `ARCHITECTURE.md` → ISR/SSG |
| **17** Testlər | `TESTING.md` |
| **18** Təhlükəsizlik | `SECURITY.md` |
| **19** Deploy | `DEPLOYMENT.md` |

> ⚠️ Cədvəldə olmayan sənədə baxma. Xəta varsa → `ERROR_CATALOG.md`.

---

**2. main-i pull et**
```bash
git checkout main && git pull origin main
```

**3. Branch yarat**
```bash
git checkout -b <növ>/<ad>
# feature/ bugfix/ chore/ docs/ refactor/ test/ hotfix/
```

**4. Kodu yaz**
- TypeScript — `any` işlətmə
- Backend — `asyncHandler` + `AppError` + `successResponse`
- Frontend — `'use client'` yalnız zəruri hallarda
- Prisma — yalnız lazım olan sahələri `select` et
- Yeni endpoint → mütləq test yaz

**5. Yoxla**
```bash
cd server && npx tsc --noEmit && npm run test && npm run lint
cd client && npx tsc --noEmit && npm run test && npm run lint
```

**6. TODO.md + AI_AGENT_CONTEXT.md yenilə** — `[ ]` → `[x]`, context faylı yenilə

**7. Commit et**
```bash
git add .
git commit -m "<növ>(<əhatə>): <nə edildi>"
# feat(auth): register endpoint əlavə edildi
# fix(cart): miqdar xətası düzəldildi
# test(auth): login integration testi
# docs(context): mərhələ 2 tamamlandı
```

**8. Push et**
```bash
git push origin <branch-adı>
```

**9. Sahibə xəbər ver**
```
✅ Tapşırıq tamamlandı!
📌 Branch: feature/m02-auth-backend
📋 Tamamlananlar: [siyahı]
🔗 PR: feature/m02-auth-backend → main
⏳ PR birləşdikdən sonra növbəti tapşırığa keçəcəyəm.
```

**10. PR birləşdikdən sonra** → ADDIM 2-yə qayıt

---

## Branch Siyahısı

```
docs/m00-documentation
chore/m01-backend-setup · chore/m01-frontend-setup
feature/m02-auth-backend · feature/m02-auth-frontend
feature/m03-layout
feature/m04-common-components
feature/m05-categories-backend · feature/m05-categories-frontend
feature/m06-products-backend · feature/m06-products-frontend
feature/m07-cart-backend · feature/m07-cart-frontend
feature/m08-coupons-backend · feature/m08-coupons-frontend
feature/m09-addresses-backend · feature/m09-addresses-frontend
feature/m10-payment-orders-backend · feature/m10-payment-orders-frontend
feature/m11-wishlist-backend · feature/m11-wishlist-frontend
feature/m12-reviews-backend · feature/m12-reviews-frontend
feature/m13-profile-backend · feature/m13-profile-frontend
feature/m14-vendor-backend · feature/m14-vendor-frontend
feature/m15-analytics-backend · feature/m15-analytics-frontend
feature/m16-seo-performance
test/m17-backend-tests · test/m17-frontend-tests · test/m17-e2e-tests
chore/m18-security
chore/m19-deployment
```

---

## Tez-tez Soruşulanlar

- **Bir neçə commit olar?** — Bəli, tövsiyə olunur
- **PR birləşməmiş yeni tapşırıq?** — Xeyr
- **Branch-dan branch?** — Xeyr, həmişə main-dən
- **TS xətası var, push edim?** — Xeyr
- **Tapşırıq yarımçıq?** — `[~]` ilə işarələ, sahibi məlumatlandır
- **Yeni Prisma modeli?** — `npx prisma migrate dev --name <ad>` sonra `npx prisma generate`
- **Stripe local test?** — `stripe listen --forward-to localhost:5000/api/payments/webhook`