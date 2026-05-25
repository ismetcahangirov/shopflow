---
description: 
---

# ERROR_CATALOG.md — Xəta Kataloqu

> **Layihə:** ShopFlow E-Commerce Platform
> **Bu fayl nədir:** AI agent inkişaf zamanı rast gəldiyi tez-tez olan xətaların səbəbi və həll yolunu burada tapır.
> **Kim istifadə edir:** AI agent — xəta olduqda əvvəlcə bura baxır, sonra sənədlərə.

---

## İstifadə Qaydası (Agent üçün)

```
1. Xəta mesajını al
2. Aşağıdakı kateqoriyalardan uyğun olanı tap
3. "Həll" bölməsini tətbiq et
4. Həll işləməzsə → əlaqəli sənədi oxu (sağ sütunda göstərilir)
```

---

## 🔴 TypeScript Xətaları

### TS2345 — Argument tipi uyğun deyil
```
Argument of type 'X' is not assignable to parameter of type 'Y'
```
**Səbəb:** Funksiyaya yanlış tip göndərilir — çox vaxt `string` lazım olan yerə `string | undefined` gedir.
**Həll:**
```typescript
// ❌
const user = await getUser(req.params.id);  // string | undefined

// ✅
const id = req.params.id;
if (!id) throw new AppError('ID lazımdır', 400, 'VALIDATION_ERROR');
const user = await getUser(id);  // indi string
```

---

### TS2339 — Property mövcud deyil
```
Property 'user' does not exist on type 'Request'
```
**Səbəb:** `express.d.ts`-də `req.user` tipi genişləndirilməyib.
**Həll:** `server/src/types/express.d.ts` faylını yoxla:
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        id:    string;
        role:  'ADMIN' | 'VENDOR' | 'CUSTOMER';
        email: string;
      };
    }
  }
}
```
**Sənəd:** `AUTH.md`

---

### TS7006 — Parameter tipi verilməyib
```
Parameter 'X' implicitly has an 'any' type
```
**Səbəb:** Funksiya parametrinin tipi yazılmayıb.
**Həll:** Hər parametrə explicit tip ver, `any` işlətmə.
```typescript
// ❌
const fn = (req, res, next) => {}

// ✅
const fn = (req: Request, res: Response, next: NextFunction): void => {}
```

---

### TS2304 — Ad tapılmır
```
Cannot find name 'Prisma'
```
**Səbəb:** `npx prisma generate` işlədilməyib.
**Həll:**
```bash
cd server && npx prisma generate
```

---

## 🔴 Prisma / Database Xətaları

### P2002 — Unique constraint pozuldu
```
Unique constraint failed on the fields: (`email`)
```
**Səbəb:** Eyni email/slug/sku artıq bazada mövcuddur.
**Həll:**
```typescript
try {
  await prisma.user.create({ data });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    throw new AppError('Bu email artıq mövcuddur', 409, 'ALREADY_EXISTS');
  }
  throw e;
}
```
**Sənəd:** `DATABASE.md`

---

### P2025 — Record tapılmadı
```
An operation failed because it depends on one or more records that were required but not found.
```
**Səbəb:** `update` və ya `delete` zamanı ID mövcud deyil.
**Həll:**
```typescript
// findUnique → null yoxla
const product = await prisma.product.findUnique({ where: { id } });
if (!product) throw new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');
```

---

### P1001 — Baza bağlantısı yoxdur
```
Can't reach database server at `localhost:5432`
```
**Səbəb:** `DATABASE_URL` `.env`-də yanlış və ya Supabase bağlantısı yoxdur.
**Həll:**
```bash
# .env faylını yoxla
cat server/.env | grep DATABASE_URL

# Supabase connection string formatı:
# postgresql://postgres:[ŞIFRƏ]@db.[PROJE_ID].supabase.co:5432/postgres
```
**Sənəd:** `DATABASE.md`, `DEPLOYMENT.md`

---

### Migration xətası — sütun mövcuddur
```
column "X" of relation "Y" already exists
```
**Səbəb:** Migration faylı ilə real DB arasında uyğunsuzluq var.
**Həll:**
```bash
# Development-də (data itə bilər!)
npx prisma migrate reset

# Production-da əsla migrate reset işlətmə
# Əvvəlcə problemi tap:
npx prisma migrate status
```
**Sənəd:** `DATABASE.md`

---

## 🔴 Auth / JWT Xətaları

### JsonWebTokenError — Token etibarsız
```
JsonWebTokenError: invalid signature
```
**Səbəb:** `JWT_SECRET` dəyişib və ya token başqa mühitdən gəlir.
**Həll:** `.env`-dəki `JWT_SECRET`-i yoxla — minimum 64 simvol olmalıdır.

---

### TokenExpiredError
```
TokenExpiredError: jwt expired
```
**Səbəb:** Access token müddəti bitib (15 dəq).
**Həll:** Frontend-in Axios interceptoru `/auth/refresh-token` çağırmalıdır. İnterceptoru yoxla:
```typescript
// src/lib/api.ts — interceptor mövcuddur?
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // refresh token logic
    }
  }
);
```
**Sənəd:** `AUTH.md`

---

## 🔴 Stripe Xətaları

### Webhook — 400 Bad Request (daima)
```
Webhook signature verification failed
```
**Səbəb 1:** `express.raw()` middleware-i `express.json()`-dan sonra qeydiyyatdadır.
**Həll:** `server.ts`-də sıranı yoxla — webhook route **mütləq** `express.json()`-dan əvvəl olmalıdır:
```typescript
// ✅ Düzgün sıra
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), webhookRoute);
app.use(express.json());
app.use('/api', allOtherRoutes);
```

**Səbəb 2:** `STRIPE_WEBHOOK_SECRET` yanlışdır.
**Həll:** Stripe Dashboard → Webhooks → endpoint secret-i kopyala, `.env`-ə yaz.
**Sənəd:** `PAYMENT.md`

---

### PaymentIntent — amount_too_small
```
StripeInvalidRequestError: Amount must be at least 50 cents
```
**Səbəb:** Stripe minimum məbləği keçmiyor (AZN üçün 0.50 AZN).
**Həll:**
```typescript
if (amount < 50) throw new AppError('Minimum sifariş məbləği 0.50 AZN-dir', 400, 'VALIDATION_ERROR');
```

---

## 🟡 Next.js / Frontend Xətaları

### Hydration mismatch
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```
**Səbəb:** Server və client render fərqli HTML çıxarır — çox vaxt `Date.now()`, `Math.random()`, `localStorage` istifadəsindən.
**Həll:**
```typescript
// ❌ Server və client fərqli nəticə verir
const id = Math.random();

// ✅ useEffect içinə al (yalnız client-də işləsin)
const [id, setId] = useState('');
useEffect(() => setId(Math.random().toString()), []);
```

---

### useRouter / useSearchParams — Server Component xətası
```
Error: useRouter only works in Client Components.
```
**Səbəb:** Server Component-də `useRouter`, `useSearchParams`, `useState` işlədilir.
**Həll:** Faylın başına `'use client'` əlavə et və ya loqikanı ayrı Client Component-ə çıxar.
**Sənəd:** `ARCHITECTURE.md`, `COMPONENTS.md`

---

### next/image — hostname konfiqurasiya edilməyib
```
Error: Invalid src prop on `next/image`, hostname "res.cloudinary.com" is not configured
```
**Həll:** `next.config.ts`-ə əlavə et:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
    { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatar
  ],
},
```

---

### TanStack Query — stale data göstərilir
```
// Yeni data gəlmir, köhnə data ekranda qalır
```
**Səbəb:** `queryKey` dəyişmir, cache invalidate edilmir.
**Həll:**
```typescript
// Mutation sonrası invalidate et
const queryClient = useQueryClient();
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['products'] });
}
```

---

## 🟡 Cloudinary Xətaları

### Upload — Invalid API credentials
```
Error: Invalid API Key
```
**Həll:** `.env`-i yoxla:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Cloudinary Dashboard → Settings → Access Keys-dən kopyala.
**Sənəd:** `MEDIA.md`

---

### Upload — File size limit
```
File size too large. Max allowed is 10MB
```
**Həll:** Multer konfiqurasiyasını yoxla:
```typescript
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new AppError('Yalnız şəkil faylları qəbul edilir', 400, 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});
```
**Sənəd:** `MEDIA.md`

---

## 🟡 Resend / Email Xətaları

### 403 — Domain doğrulanmayıb
```
The domain is not verified. Please verify your domain before sending emails.
```
**Həll:** Resend Dashboard → Domains → `shopflow.az` üçün DNS TXT record əlavə et, doğrula.
**Sənəd:** `DEPLOYMENT.md`

---

### Rate limit — 429
```
You have exceeded your rate limit.
```
**Həll:** Pulsuz planda 3000 email/ay, 100/gün. Email göndərmə tezliyini yoxla.

---

## 🟡 CORS Xətaları

### CORS policy blocked
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```
**Həll:** `server/src/config/corsOptions.ts`-i yoxla:
```typescript
const corsOptions = {
  origin: process.env.CLIENT_URL, // 'http://localhost:3000'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};
```
`.env`-də `CLIENT_URL=http://localhost:3000` var mı yoxla.
**Sənəd:** `SECURITY.md`

---

## 🟡 next-intl Xətaları

### Missing translation key
```
Warning: Missing translation for key "product.add_to_cart" in locale "en"
```
**Həll:** `az.json`, `en.json`, `ru.json` — hər üçündə açar mövcuddur mı yoxla. Yeni açar əlavə edəndə **üç faylın hamısına** əlavə et.
**Sənəd:** `I18N.md`

---

## ⚪ Ümumi Node.js / Express Xətaları

### Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Həll:**
```bash
# Prosesi tap və öldür
lsof -i :5000
kill -9 [PID]

# və ya
npx kill-port 5000
```

---

### Cannot find module
```
Error: Cannot find module '@/components/...'
```
**Səbəb:** `tsconfig.json`-da path alias konfiqurasiya edilməyib.
**Həll:** `client/tsconfig.json`-u yoxla:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📋 Xəta → Sənəd Xəritəsi

| Xəta növü         | Baxılacaq sənəd               |
|-------------------|-------------------------------|
| Auth / JWT        | `AUTH.md`, `SECURITY.md`      |
| Prisma / Database | `DATABASE.md`                 |
| Stripe / Webhook  | `PAYMENT.md`                  |
| Cloudinary        | `MEDIA.md`                    |
| next-intl         | `I18N.md`                     |
| Next.js / React   | `ARCHITECTURE.md`, `COMPONENTS.md` |
| Deploy / ENV      | `DEPLOYMENT.md`               |
| TypeScript        | `rules.md`                    |
| Test              | `TESTING.md`                  |
| CORS / Security   | `SECURITY.md`                 |
