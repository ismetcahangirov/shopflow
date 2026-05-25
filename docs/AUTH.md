# AUTH.md — Autentifikasiya & Avtorizasiya

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Ümumi Baxış

Sistem iki paralel autentifikasiya üsulunu dəstəkləyir:

| Üsul | Açıqlama |
|---|---|
| **Email + Şifrə** | Klassik qeydiyyat/giriş + email təsdiq |
| **Google OAuth 2.0** | Google hesabı ilə bir kliklə giriş |

Hər iki üsul eyni JWT token sistemini istifadə edir.  
Frontend: **Next.js 14 App Router + Zustand**  
Backend: **Express.js + TypeScript + Prisma**

---

## 2. JWT Token Strategiyası

### 2.1 Token Növləri

```
┌──────────────────────────────────────────────────┐
│                 ACCESS TOKEN                     │
│  • Müddət:       15 dəqiqə                       │
│  • Saxlanır:     Zustand authStore (memory)      │
│  • İstifadə:     Hər API sorğusunda              │
│  • Header:       Authorization: Bearer <token>   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                 REFRESH TOKEN                    │
│  • Müddət:       30 gün                          │
│  • Saxlanır:     httpOnly Cookie                 │
│  • Yol:          /api/auth/refresh-token         │
│  • Məqsəd:       Access token-i avtomatik yenilə │
└──────────────────────────────────────────────────┘
```

### 2.2 Token Payload

```typescript
// Access Token Payload
interface AccessTokenPayload {
  sub:   string;   // User cuid() — "clx1234abc"
  email: string;
  role:  'ADMIN' | 'VENDOR' | 'CUSTOMER';
  iat:   number;   // Yaradılma vaxtı (Unix timestamp)
  exp:   number;   // Bitmə vaxtı
}

// Refresh Token Payload
interface RefreshTokenPayload {
  sub: string;     // Yalnız User ID
  iat: number;
  exp: number;
}
```

### 2.3 Token Yaratma (Backend — TypeScript)

```typescript
// src/utils/generateToken.ts

import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      sub:   user.id,
      email: user.email,
      role:  user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );
};

export const generateResetToken = (): string => {
  // Kriptoqrafik təhlükəsiz random token
  return require('crypto').randomBytes(32).toString('hex');
};
```

### 2.4 Refresh Token Cookie Konfiqurasiyası

```typescript
// src/controllers/authController.ts — login/register cavabında

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,                                          // JS ilə oxunmur → XSS qoruması
  secure:   process.env.NODE_ENV === 'production',        // HTTPS only (production)
  sameSite: 'strict',                                     // CSRF qoruması
  maxAge:   30 * 24 * 60 * 60 * 1000,                    // 30 gün (millisaniyə)
  path:     '/api/auth',                                  // Yalnız auth endpointlərə göndərilir
});
```

---

## 3. Email + Şifrə Axını

### 3.1 Qeydiyyat Axını

```
İstifadəçi
    │  POST /api/auth/register
    │  { name, email, password, confirmPassword }
    ▼
Validasiya (express-validator + Zod)
    │  • Bütün sahələr doldurulub?
    │  • Email formatı doğrudurmu?
    │  • Şifrə tələblərə uyğundurmu? (8+ simvol, böyük hərf, rəqəm)
    │  • Şifrələr eynidir?
    ▼
Email Mövcudluq Yoxlaması
    │  prisma.user.findUnique({ where: { email } })
    │  Varsa → 409 ALREADY_EXISTS
    ▼
Şifrə Hashlanması
    │  bcrypt.hash(password, 12)
    ▼
Email Təsdiq Tokeni
    │  crypto.randomBytes(32).toString('hex')
    │  verifyToken DB-yə saxlanır
    ▼
User Yaradılması (Prisma)
    │  prisma.user.create({ role: 'CUSTOMER', isVerified: false })
    ▼
Təsdiq Emaili Göndərilir (Resend)
    │  https://shopflow.az/verify-email/<token>
    ▼
Token Generasiyası
    │  accessToken  (15 dəq)
    │  refreshToken (30 gün) → httpOnly cookie
    ▼
Cavab 201
    { user, accessToken }
```

### 3.2 Giriş Axını

```
İstifadəçi
    │  POST /api/auth/login
    │  { email, password }
    ▼
User Tapılması
    │  prisma.user.findUnique({ where: { email } })
    │  Yoxdursa → 401 INVALID_CREDENTIALS
    ▼
Hesab Statusu
    │  isActive === false → 403 ACCOUNT_DISABLED
    ▼
Şifrə Yoxlaması
    │  bcrypt.compare(password, user.password)
    │  Uyğun deyil → 401 INVALID_CREDENTIALS
    ▼
lastLoginAt Yeniləmə
    │  prisma.user.update({ lastLoginAt: new Date() })
    ▼
Token Generasiyası
    │  accessToken  (15 dəq)
    │  refreshToken (30 gün) → httpOnly cookie
    ▼
Cavab 200
    { user (şifrəsiz), accessToken }
```

### 3.3 Token Yeniləmə Axını (Auto Refresh)

```
Axios Interceptor (Frontend)
    │  API sorğusu göndərilir
    ▼
Server → 401 TOKEN_EXPIRED
    │
    ▼
Response Interceptor xətanı tutur
    │  POST /api/auth/refresh-token
    │  (refreshToken cookie avtomatik göndərilir — withCredentials: true)
    ▼
Server:
    │  1. Cookie-dən refreshToken oxu
    │  2. jwt.verify(token, JWT_REFRESH_SECRET)
    │  3. DB-dəki refreshToken ilə müqayisə et
    │  4. User aktiv mi?
    │  Xəta varsa → 401 → frontend logout edir
    ▼
Yeni accessToken qaytarılır
    │
    ▼
Zustand authStore-da token yenilənir
    │
    ▼
Orijinal sorğu yenidən göndərilir
    (istifadəçi heç nə hiss etmir)
```

---

## 4. Backend Auth Middleware (TypeScript)

### 4.1 Auth Middleware

```typescript
// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt                                 from 'jsonwebtoken';
import { prisma }                          from '../config/db';
import { AccessTokenPayload }              from '../types';

// req.user tipini genişləndir
declare global {
  namespace Express {
    interface Request {
      user?: {
        id:    string;
        email: string;
        role:  string;
      };
    }
  }
}

export const protect = async (
  req:  Request,
  res:  Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Giriş üçün autentifikasiya tələb olunur',
      error:   'UNAUTHORIZED',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AccessTokenPayload;

    const user = await prisma.user.findUnique({
      where:  { id: decoded.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'İstifadəçi tapılmadı',
        error:   'UNAUTHORIZED',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Hesabınız deaktiv edilib. Admin ilə əlaqə saxlayın.',
        error:   'ACCOUNT_DISABLED',
      });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token müddəti bitib',
        error:   'TOKEN_EXPIRED',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Token etibarsızdır',
      error:   'UNAUTHORIZED',
    });
  }
};
```

### 4.2 Rol Middleware

```typescript
// src/middleware/roleMiddleware.ts

import { Request, Response, NextFunction } from 'express';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autentifikasiya tələb olunur',
        error:   'UNAUTHORIZED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Bu əməliyyat üçün icazəniz yoxdur. Tələb olunan: ${roles.join(' | ')}`,
        error:   'FORBIDDEN',
      });
      return;
    }

    next();
  };
};

// ── Route-larda istifadə ──────────────────────────────
// router.get('/',        protect, authorize('ADMIN'),            getUsers);
// router.get('/my',      protect, authorize('CUSTOMER'),         getMyOrders);
// router.post('/',       protect, authorize('ADMIN', 'VENDOR'),  createProduct);
// router.patch('/status',protect, authorize('ADMIN'),            updateOrderStatus);
```

### 4.3 Auth Controller (TypeScript)

```typescript
// src/controllers/authController.ts

import { Request, Response }    from 'express';
import bcrypt                   from 'bcryptjs';
import jwt                      from 'jsonwebtoken';
import { asyncHandler }         from '../utils/asyncHandler';
import { AppError }             from '../utils/AppError';
import { successResponse }      from '../utils/apiResponse';
import { prisma }               from '../config/db';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
}                               from '../utils/generateToken';
import { sendEmail }            from '../utils/sendEmail';

// ── Qeydiyyat ────────────────────────────────────────────
export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // Email mövcuddurmu?
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new AppError('Bu email artıq qeydiyyatdan keçib', 409, 'ALREADY_EXISTS');
    }

    // Şifrəni hash et
    const hashedPassword = await bcrypt.hash(password, 12);

    // Email təsdiq tokeni yarat
    const verifyToken = generateResetToken();

    // İstifadəçini yarat
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password:   hashedPassword,
        verifyToken,
        isVerified: false,
        role:       'CUSTOMER',
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Təsdiq emaili göndər
    await sendEmail({
      to:      email,
      subject: 'ShopFlow — Email Təsdiqi',
      html:    `
        <h2>Salam, ${name}!</h2>
        <p>Email ünvanınızı təsdiqləmək üçün aşağıdakı düyməyə basın:</p>
        <a href="${process.env.CLIENT_URL}/verify-email/${verifyToken}">
          Email-i Təsdiqlə
        </a>
        <p>Bu link 24 saat etibarlıdır.</p>
      `,
    });

    // Token-lər
    const accessToken  = generateAccessToken(user as any);
    const refreshToken = generateRefreshToken(user as any);

    // refreshToken-i DB-yə saxla
    await prisma.user.update({
      where: { id: user.id },
      data:  { refreshToken: await bcrypt.hash(refreshToken, 10) },
    });

    // httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   30 * 24 * 60 * 60 * 1000,
      path:     '/api/auth',
    });

    successResponse(res, {
      statusCode: 201,
      message:    'Qeydiyyat uğurla tamamlandı. Emailinizi təsdiqləyin.',
      data:       { user, accessToken },
    });
  }
);

// ── Giriş ────────────────────────────────────────────────
export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Təhlükəsizlik: email/şifrə fərqini açıqlamırıq
    if (!user || !user.password) {
      throw new AppError(
        'Email və ya şifrə yanlışdır', 401, 'INVALID_CREDENTIALS'
      );
    }

    if (!user.isActive) {
      throw new AppError('Hesabınız deaktiv edilib', 403, 'ACCOUNT_DISABLED');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError(
        'Email və ya şifrə yanlışdır', 401, 'INVALID_CREDENTIALS'
      );
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data:  {
        refreshToken: await bcrypt.hash(refreshToken, 10),
        lastLoginAt:  new Date(),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   30 * 24 * 60 * 60 * 1000,
      path:     '/api/auth',
    });

    // Cavabdan şifrəni çıxar
    const { password: _, refreshToken: __, ...safeUser } = user;

    successResponse(res, {
      message: 'Giriş uğurlu oldu',
      data:    { user: safeUser, accessToken },
    });
  }
);

// ── Token Yeniləmə ───────────────────────────────────────
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new AppError('Refresh token yoxdur', 401, 'UNAUTHORIZED');
    }

    let decoded: { sub: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { sub: string };
    } catch {
      throw new AppError('Token etibarsızdır', 401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user?.refreshToken || !user.isActive) {
      throw new AppError('Token etibarsızdır', 401, 'UNAUTHORIZED');
    }

    // DB-dəki hash ilə müqayisə
    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) {
      throw new AppError('Token etibarsızdır', 401, 'UNAUTHORIZED');
    }

    const newAccessToken = generateAccessToken(user);

    successResponse(res, {
      data: { accessToken: newAccessToken },
    });
  }
);

// ── Çıxış ────────────────────────────────────────────────
export const logout = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (token) {
      // DB-dən refreshToken-i sil
      try {
        const decoded = jwt.verify(
          token, process.env.JWT_REFRESH_SECRET!
        ) as { sub: string };

        await prisma.user.update({
          where: { id: decoded.sub },
          data:  { refreshToken: null },
        });
      } catch {
        // Token artıq etibarsızdır — önəmli deyil
      }
    }

    // Cookie-ni sil
    res.clearCookie('refreshToken', { path: '/api/auth' });

    successResponse(res, { message: 'Çıxış uğurlu oldu' });
  }
);
```

---

## 5. Google OAuth 2.0 Axını

### 5.1 Tam Axın Diaqramı

```
İstifadəçi "Google ilə daxil ol" düyməsinə basır
    │
    ▼
@react-oauth/google — Google Sign-In popup açılır
    │
    ▼
İstifadəçi Google hesabını seçir
    │
    ▼
Google → Frontend-ə ID Token qaytarır (credential)
    │
    ▼
Frontend → Backend-ə göndərir
    │  POST /api/auth/google
    │  { googleToken: "eyJhbGci..." }
    ▼
Backend Google Token-i doğrulayır
    │  google-auth-library → verifyIdToken()
    │  { email, name, picture, sub: googleId }
    ▼
İstifadəçi mövcuddurmu? (email ilə axtar)
    ├── Yox → Yeni CUSTOMER hesabı yarat (isVerified: true)
    ├── Var, googleId yoxdur → googleId əlavə et
    └── Var, googleId var → Normal login
    ▼
isActive yoxla
    │  false → 403 ACCOUNT_DISABLED
    ▼
JWT Token generasiyası
    │  accessToken + refreshToken cookie
    ▼
Cavab 200
    { user, accessToken, isNewUser: boolean }
```

### 5.2 Backend Google Handler (TypeScript)

```typescript
// src/controllers/authController.ts — googleAuth

import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = asyncHandler(
  async (req: Request, res: Response) => {
    const { googleToken } = req.body;

    if (!googleToken) {
      throw new AppError('Google token tələb olunur', 400, 'VALIDATION_ERROR');
    }

    // Google token-i doğrula
    const ticket = await googleClient.verifyIdToken({
      idToken:  googleToken,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new AppError('Google token etibarsızdır', 401, 'UNAUTHORIZED');
    }

    const { email, name, picture, sub: googleId } = payload;

    let isNewUser = false;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Yeni istifadəçi — Google ilə qeydiyyat
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          name:       name!,
          email,
          googleId,
          avatar:     picture,
          role:       'CUSTOMER',
          isActive:   true,
          isVerified: true,   // Google email-i artıq təsdiqlənib
          password:   null,
        },
      });
    } else if (!user.googleId) {
      // Mövcud hesaba Google bağla
      user = await prisma.user.update({
        where: { id: user.id },
        data:  { googleId, avatar: user.avatar ?? picture },
      });
    }

    if (!user.isActive) {
      throw new AppError('Hesabınız deaktiv edilib', 403, 'ACCOUNT_DISABLED');
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data:  {
        refreshToken: await bcrypt.hash(refreshToken, 10),
        lastLoginAt:  new Date(),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   30 * 24 * 60 * 60 * 1000,
      path:     '/api/auth',
    });

    const { password: _, refreshToken: __, ...safeUser } = user;

    successResponse(res, {
      message: isNewUser ? 'Qeydiyyat uğurlu oldu' : 'Giriş uğurlu oldu',
      data:    { user: safeUser, accessToken, isNewUser },
    });
  }
);
```

### 5.3 Frontend Google Düyməsi (Next.js)

```typescript
// components/auth/GoogleButton.tsx
'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore }                    from '@/store/authStore';
import { useRouter }                       from 'next/navigation';
import axios                               from '@/lib/api';

export function GoogleButton() {
  const { setUser, setToken } = useAuthStore();
  const router                = useRouter();

  const handleSuccess = async (response: CredentialResponse) => {
    try {
      const { data } = await axios.post('/auth/google', {
        googleToken: response.credential,
      });

      setUser(data.data.user);
      setToken(data.data.accessToken);

      router.push('/');
    } catch (error) {
      console.error('Google giriş xətası:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error('Google giriş uğursuz oldu')}
      useOneTap
      shape="rectangular"
      text="continue_with"
      locale="az"
    />
  );
}
```

```typescript
// app/layout.tsx — Google Provider
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

---

## 6. Şifrəni Unutdum Axını

```
İstifadəçi email daxil edir
    │  POST /api/auth/forgot-password
    │  { email }
    ▼
User-i tap (mövcud deyilsə susqun keç — email enumeration qoruması)
    ▼
Reset Token yarat
    │  crypto.randomBytes(32).toString('hex')
    │  Token-i hash-lənərək DB-yə saxla (resetToken)
    │  Bitmə tarixi: 30 dəqiqə (resetTokenExp)
    ▼
Email göndər (Resend)
    │  Link: https://shopflow.az/reset-password/<token>
    ▼
İstifadəçi yeni şifrə daxil edir
    │  POST /api/auth/reset-password/:token
    │  { password, confirmPassword }
    ▼
Token yoxla
    │  1. DB-dən resetToken tap (hash müqayisəsi)
    │  2. resetTokenExp > now? (müddəti bitibmi?)
    │  Xəta → 400 INVALID_RESET_TOKEN
    ▼
Şifrəni yenilə
    │  bcrypt.hash(newPassword, 12)
    │  resetToken = null
    │  resetTokenExp = null
    │  refreshToken = null  ← Bütün aktiv sessiyaları bitir
    ▼
Cavab 200 → Login səhifəsinə yönləndir
```

---

## 7. Email Təsdiq Axını

```
Qeydiyyat zamanı
    │  crypto.randomBytes(32) → verifyToken DB-yə
    │  Email göndərilir
    ▼
İstifadəçi linki açır
    │  GET /api/auth/verify-email/:token
    ▼
Token yoxla
    │  prisma.user.findFirst({ where: { verifyToken: token } })
    │  Yoxdursa → 400 INVALID_TOKEN
    ▼
İstifadəçini yenilə
    │  isVerified = true
    │  verifyToken = null
    ▼
Cavab 200
```

---

## 8. Frontend — Zustand Auth Store

```typescript
// store/authStore.ts

import { create }        from 'zustand';
import { persist }       from 'zustand/middleware';
import { User }          from '@/types/auth.types';

interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  setUser:         (user: User) => void;
  setToken:        (token: string) => void;
  setCredentials:  (user: User, token: string) => void;
  clearAuth:       () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: true }),

      setToken: (accessToken) =>
        set({ accessToken }),

      setCredentials: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name:    'shopflow-auth',
      // Yalnız user saxla — token memory-də qalsın (təhlükəsizlik)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

---

## 9. Frontend — Axios Instance & Auto Refresh

```typescript
// lib/api.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore }                                  from '@/store/authStore';

const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,    // Cookie-lər göndərilsin (refresh token üçün)
  timeout:         10000,
});

// ── Request Interceptor — access token əlavə et ──────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — token expire → yenilə ─────────
let isRefreshing = false;
let failedQueue:  Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        // withCredentials: true — cookie avtomatik göndərilir
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = data.data.accessToken;
        useAuthStore.getState().setToken(newToken);

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);

      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 10. Frontend — Protected Route (Next.js App Router)

```typescript
// components/layout/ProtectedRoute.tsx
'use client';

import { useEffect }     from 'react';
import { useRouter }     from 'next/navigation';
import { useAuthStore }  from '@/store/authStore';

interface ProtectedRouteProps {
  children:     React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router                    = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated || !user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
```

```typescript
// Admin layout — app/[locale]/admin/layout.tsx
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 11. useRole Hook

```typescript
// hooks/useRole.ts
'use client';

import { useAuthStore } from '@/store/authStore';

export const useRole = () => {
  const { user } = useAuthStore();
  return {
    role:       user?.role,
    isAdmin:    user?.role === 'ADMIN',
    isVendor:   user?.role === 'VENDOR',
    isCustomer: user?.role === 'CUSTOMER',
    isLoggedIn: !!user,
  };
};

// Komponentdə istifadə:
// const { isAdmin, isVendor } = useRole();
// {isAdmin && <AdminPanel />}
// {isVendor && <VendorDashboard />}
```

---

## 12. Şifrə Siyasəti

| Tələb | Dəyər |
|---|---|
| Minimum uzunluq | 8 simvol |
| Maksimum uzunluq | 72 simvol (bcrypt limiti) |
| Böyük hərf | Ən az 1 |
| Kiçik hərf | Ən az 1 |
| Rəqəm | Ən az 1 |
| Xüsusi simvol | Tövsiyə olunur |
| Hash alqoritmi | bcryptjs |
| Salt rounds | 12 (~250ms) |

### Paylaşılan Zod Schema (shared/schemas/auth.schema.ts)

```typescript
// shared/schemas/auth.schema.ts
// Bu fayl həm frontend həm backend tərəfindən import edilir

import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8,  'Şifrə minimum 8 simvol olmalıdır')
  .max(72, 'Şifrə maksimum 72 simvol ola bilər')
  .regex(/[A-Z]/, 'Ən az 1 böyük hərf tələb olunur')
  .regex(/[a-z]/, 'Ən az 1 kiçik hərf tələb olunur')
  .regex(/[0-9]/, 'Ən az 1 rəqəm tələb olunur');

export const registerSchema = z
  .object({
    name:            z.string().min(2, 'Ad minimum 2 simvol').max(50),
    email:           z.string().email('Düzgün email daxil edin'),
    password:        passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Şifrələr uyğun deyil',
    path:    ['confirmPassword'],
  });

export const loginSchema = z.object({
  email:    z.string().email('Düzgün email daxil edin'),
  password: z.string().min(1, 'Şifrəni daxil edin'),
});

export const resetPasswordSchema = z
  .object({
    password:        passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Şifrələr uyğun deyil',
    path:    ['confirmPassword'],
  });

export type RegisterInput      = z.infer<typeof registerSchema>;
export type LoginInput         = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

---

## 13. Təhlükəsizlik Xülasəsi

| Risq | Qoruma Üsulu |
|---|---|
| XSS ilə token oğurlanması | Refresh token `httpOnly` cookie-də — JS ilə oxunmur |
| CSRF hücumu | `sameSite: 'strict'` cookie parametri |
| Brute force | Rate limiting (5 cəhd / 15 dəq) |
| Token saxtalaşdırılması | JWT imzası `JWT_SECRET` ilə yoxlanır |
| Köhnə token istifadəsi | Access token 15 dəq, refresh token 30 gün |
| Zəif şifrə | Paylaşılan Zod schema (frontend + backend) |
| Email enumeration | Şifrə sıfırlama cavabı eynidir (email olsun ya olmasın) |
| Hesab oğurlanması | Google OAuth 2.0 + email təsdiq sistemi |
| Şifrə saxlama | Yalnız bcrypt hash (12 round) — heç vaxt plaintext |
| Refresh token oğurlanması | DB-də hash-lənərək saxlanır + cookie ilə müqayisə |
| Birdən çox sessiya | Logout zamanı DB-dəki refreshToken silinir |
| Deaktiv hesab | Hər sorğuda `isActive` yoxlanır |
