# TESTING.md — Test Strategiyası

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Test Piramidası

```
           /\
          /  \
         / E2E\          ← Az, yavaş — kritik axınlar
        /──────\            (Playwright)
       /        \
      /Integration\     ← Orta — API endpointləri
     /────────────\        (Jest + Supertest)
    /              \
   /   Unit Tests   \   ← Çox, sürətli — funksiyalar, utility
  /──────────────────\     (Jest / Vitest)
```

| Növ | Alət | Hədəf | Coverage |
|---|---|---|---|
| Unit | Jest (backend), Vitest (frontend) | Controller-lər, utility-lər, Zustand store-lar | 80%+ |
| Integration | Jest + Supertest | API endpointləri, middleware, Prisma | 70%+ |
| E2E | Playwright | Kritik axınlar: login, checkout, sifariş | Əsas axınlar |

---

## 2. Backend Test Qurulumu

### 2.1 Quraşdırma

```bash
cd server
npm install --save-dev \
  jest \
  supertest \
  @types/jest \
  @types/supertest \
  ts-jest \
  jest-mock-extended
```

### 2.2 `package.json` Konfiqurasiyası

```json
{
  "scripts": {
    "test":          "jest --runInBand",
    "test:watch":    "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci":       "jest --runInBand --forceExit --coverage"
  },
  "jest": {
    "preset":           "ts-jest",
    "testEnvironment":  "node",
    "testMatch":        ["**/__tests__/**/*.test.ts"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    "collectCoverageFrom": [
      "src/controllers/**/*.ts",
      "src/middleware/**/*.ts",
      "src/utils/**/*.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches":   70,
        "functions":  80,
        "lines":      80,
        "statements": 80
      }
    },
    "setupFilesAfterFramework": ["<rootDir>/src/__tests__/setup.ts"],
    "globalSetup":    "<rootDir>/src/__tests__/globalSetup.ts",
    "globalTeardown": "<rootDir>/src/__tests__/globalTeardown.ts"
  }
}
```

### 2.3 Test Setup (Prisma ilə)

LMS-dən fərqli olaraq MongoDB Memory Server yoxdur.  
PostgreSQL üçün **ayrı test verilənlər bazası** istifadə edirik.

```typescript
// src/__tests__/setup.ts

import { prisma } from '../config/db';

// Hər test faylından əvvəl — cədvəlləri təmizlə
beforeEach(async () => {
  // Sıra vacibdir — foreign key constraint-lərə görə
  await prisma.orderItem.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

```typescript
// src/__tests__/globalSetup.ts

export default async function globalSetup() {
  // Test mühiti yoxla
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Test yalnız NODE_ENV=test ilə işləyə bilər!');
  }
  // Test DB-nin mövcudluğunu yoxla
  if (!process.env.DATABASE_URL?.includes('test')) {
    throw new Error('DATABASE_URL test bazasına işarə etməlidir!');
  }
}
```

```typescript
// src/__tests__/globalTeardown.ts

export default async function globalTeardown() {
  // Əlavə cleanup (lazım olsa)
}
```

**`.env.test` faylı:**

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@localhost:5432/shopflow_test
JWT_SECRET=test_jwt_secret_min_64_chars_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_REFRESH_SECRET=test_refresh_secret_min_64_chars_xxxxxxxxxxxxxxxxxxxxxxx
```

**Test DB yaratma:**

```bash
# PostgreSQL-də test DB yarat
psql -U postgres -c "CREATE DATABASE shopflow_test;"

# Test DB-ni migrate et
DATABASE_URL=postgresql://postgres:password@localhost:5432/shopflow_test \
  npx prisma migrate deploy
```

### 2.4 Test Köməkçi Funksiyaları

```typescript
// src/__tests__/helpers/testHelpers.ts

import supertest             from 'supertest';
import bcrypt                from 'bcryptjs';
import { prisma }            from '../../config/db';
import { generateAccessToken } from '../../utils/generateToken';
import app                   from '../../server';
import { Role }              from '@prisma/client';

export const api = supertest(app);

// ── İstifadəçi yaratma helper-ləri ───────────────────────

export const createTestUser = async (overrides: {
  role?:       Role;
  email?:      string;
  isActive?:   boolean;
  isVerified?: boolean;
} = {}) => {
  const password = await bcrypt.hash('Test@1234', 12);
  return prisma.user.create({
    data: {
      name:       'Test İstifadəçi',
      email:      overrides.email      ?? `test_${Date.now()}@example.com`,
      password,
      role:       overrides.role       ?? 'CUSTOMER',
      isActive:   overrides.isActive   ?? true,
      isVerified: overrides.isVerified ?? true,
    },
  });
};

export const createTestAdmin = () =>
  createTestUser({ role: 'ADMIN', email: 'admin@test.com' });

export const createTestVendor = async () => {
  const user = await createTestUser({ role: 'VENDOR', email: 'vendor@test.com' });
  const vendor = await prisma.vendor.create({
    data: {
      storeName: 'Test Mağazası',
      slug:      'test-magazasi',
      status:    'APPROVED',
      userId:    user.id,
    },
  });
  return { user, vendor };
};

export const createTestCustomer = () =>
  createTestUser({ role: 'CUSTOMER', email: 'customer@test.com' });

// ── Token helper-ləri ─────────────────────────────────────

export const getAuthHeader = (user: { id: string; email: string; role: string }) => ({
  Authorization: `Bearer ${generateAccessToken(user as any)}`,
});

// ── Məhsul yaratma helper-i ───────────────────────────────

export const createTestCategory = (overrides: { parentId?: string } = {}) =>
  prisma.category.create({
    data: {
      name:     'Test Kateqoriya',
      slug:     `test-category-${Date.now()}`,
      isActive: true,
      ...overrides,
    },
  });

export const createTestProduct = async (overrides: {
  categoryId?: string;
  vendorId?:   string;
  price?:      number;
  stock?:      number;
  isActive?:   boolean;
} = {}) => {
  const category = overrides.categoryId
    ? { id: overrides.categoryId }
    : await createTestCategory();

  return prisma.product.create({
    data: {
      name:       'Test Məhsul',
      slug:       `test-product-${Date.now()}`,
      description:'Test məhsul açıqlaması',
      price:      overrides.price    ?? 99.99,
      sku:        `SKU-${Date.now()}`,
      stock:      overrides.stock    ?? 100,
      isActive:   overrides.isActive ?? true,
      categoryId: category.id,
      vendorId:   overrides.vendorId,
    },
  });
};

// ── Ünvan yaratma helper-i ───────────────────────────────
export const createTestAddress = (userId: string) =>
  prisma.address.create({
    data: {
      fullName:  'Test İstifadəçi',
      phone:     '+994501234567',
      city:      'Bakı',
      district:  'Nəsimi',
      street:    'Test küçəsi 1',
      isDefault: true,
      userId,
    },
  });
```

---

## 3. Backend — Unit Testlər

### 3.1 Utility Funksiya Testləri

```typescript
// src/__tests__/unit/utils/slugify.test.ts

import { slugify } from '../../../utils/slugify';

describe('slugify()', () => {
  it('boşluqları tire ilə əvəz etməlidir', () => {
    expect(slugify('iPhone 15 Pro')).toBe('iphone-15-pro');
  });

  it('azərbaycanca hərfləri transliterasiya etməlidir', () => {
    expect(slugify('Böyük Əlif Şüşə')).toBe('boyuk-elif-suse');
  });

  it('xüsusi simvolları silməlidir', () => {
    expect(slugify('Məhsul #1 (Yeni!)')).toBe('mehsul-1-yeni');
  });

  it('ardıcıl tire-ləri birləşdirməlidir', () => {
    expect(slugify('test  məhsul')).toBe('test-mehsul');
  });

  it('boş string üçün boş string qaytarmalıdır', () => {
    expect(slugify('')).toBe('');
  });
});
```

```typescript
// src/__tests__/unit/utils/formatPrice.test.ts

import { formatPrice } from '../../../utils/formatPrice';

describe('formatPrice()', () => {
  it('AZN valyutası ilə formatlamalıdır', () => {
    const result = formatPrice(99.99, 'az');
    expect(result).toContain('99,99');
    expect(result).toContain('₼');
  });

  it('sıfır məbləği düzgün formatlamalıdır', () => {
    const result = formatPrice(0, 'az');
    expect(result).toContain('0,00');
  });

  it('böyük məbləği formatlamalıdır', () => {
    const result = formatPrice(2499.99, 'az');
    expect(result).toContain('2.499,99');
  });
});
```

```typescript
// src/__tests__/unit/utils/AppError.test.ts

import { AppError } from '../../../utils/AppError';

describe('AppError', () => {
  it('düzgün parametrlərlə yaradılmalıdır', () => {
    const err = new AppError('Məhsul tapılmadı', 404, 'NOT_FOUND');

    expect(err.message).toBe('Məhsul tapılmadı');
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe('NOT_FOUND');
    expect(err.isOperational).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it('detallar əlavə etmək mümkün olmalıdır', () => {
    const details = { field: 'email', value: 'yanlış' };
    const err = new AppError('Xəta', 400, 'VALIDATION_ERROR', details);
    expect(err.details).toEqual(details);
  });
});
```

---

## 4. Backend — Integration Testlər (API)

### 4.1 Auth Endpointləri

```typescript
// src/__tests__/integration/auth.test.ts

import { api, createTestCustomer, getAuthHeader } from '../helpers/testHelpers';

describe('AUTH API', () => {

  // ── POST /api/auth/register ──────────────────────────────
  describe('POST /api/auth/register', () => {
    const validData = {
      name:            'Əli Həsənov',
      email:           'ali@test.com',
      password:        'Test@1234',
      confirmPassword: 'Test@1234',
    };

    it('uğurlu qeydiyyat — 201 + token qaytarmalıdır', async () => {
      const res = await api
        .post('/api/auth/register')
        .send(validData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('ali@test.com');
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('şifrə tələblərə uyğun deyilsə — 400 qaytarmalıdır', async () => {
      const res = await api
        .post('/api/auth/register')
        .send({ ...validData, password: '123', confirmPassword: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('eyni email ilə 2-ci qeydiyyat — 409 qaytarmalıdır', async () => {
      await api.post('/api/auth/register').send(validData);
      const res = await api.post('/api/auth/register').send(validData);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('ALREADY_EXISTS');
    });

    it('şifrələr uyğun deyilsə — 400 qaytarmalıdır', async () => {
      const res = await api.post('/api/auth/register').send({
        ...validData,
        confirmPassword: 'DifferentPass@1234',
      });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /api/auth/login ─────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestCustomer();
    });

    it('düzgün credentials ilə giriş — 200 + token', async () => {
      const res = await api.post('/api/auth/login').send({
        email:    'customer@test.com',
        password: 'Test@1234',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
      // httpOnly cookie yoxla
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('yanlış şifrə — 401 INVALID_CREDENTIALS', async () => {
      const res = await api.post('/api/auth/login').send({
        email:    'customer@test.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('INVALID_CREDENTIALS');
    });

    it('mövcud olmayan email — 401 (enumeration qoruması)', async () => {
      const res = await api.post('/api/auth/login').send({
        email:    'notexist@test.com',
        password: 'Test@1234',
      });

      expect(res.status).toBe(401);
      // Eyni xəta mesajı — email fərqi açıqlanmır
      expect(res.body.error).toBe('INVALID_CREDENTIALS');
    });

    it('deaktiv hesab — 403 ACCOUNT_DISABLED', async () => {
      const user = await createTestCustomer();
      await prisma.user.update({
        where: { id: user.id },
        data:  { isActive: false },
      });

      const res = await api.post('/api/auth/login').send({
        email:    user.email,
        password: 'Test@1234',
      });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('ACCOUNT_DISABLED');
    });
  });

  // ── GET /api/users/me ─────────────────────────────────────
  describe('GET /api/users/me', () => {
    it('token ilə öz profilini görə bilir', async () => {
      const user = await createTestCustomer();
      const res  = await api
        .get('/api/users/me')
        .set(getAuthHeader(user));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data.email).toBe(user.email);
    });

    it('token olmadan — 401', async () => {
      const res = await api.get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });
});
```

---

### 4.2 Məhsul Endpointləri

```typescript
// src/__tests__/integration/products.test.ts

import {
  api, createTestAdmin, createTestVendor,
  createTestCustomer, createTestProduct,
  createTestCategory, getAuthHeader,
} from '../helpers/testHelpers';

describe('PRODUCTS API', () => {

  // ── GET /api/products ─────────────────────────────────────
  describe('GET /api/products', () => {
    beforeEach(async () => {
      const category = await createTestCategory();
      await Promise.all([
        createTestProduct({ categoryId: category.id, price: 100 }),
        createTestProduct({ categoryId: category.id, price: 200 }),
        createTestProduct({ categoryId: category.id, price: 300 }),
      ]);
    });

    it('məhsul siyahısını qaytarmalıdır', async () => {
      const res = await api.get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(3);
    });

    it('qiymət filteri işləməlidir', async () => {
      const res = await api.get('/api/products?minPrice=150&maxPrice=250');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(Number(res.body.data[0].price)).toBe(200);
    });

    it('axtarış işləməlidir', async () => {
      const category = await createTestCategory();
      await createTestProduct({ categoryId: category.id });

      const res = await api.get('/api/products?search=Test Məhsul');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('pagination işləməlidir', async () => {
      const res = await api.get('/api/products?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.pages).toBe(2);
    });
  });

  // ── GET /api/products/:slug ───────────────────────────────
  describe('GET /api/products/:slug', () => {
    it('slug ilə məhsul tapılmalıdır', async () => {
      const category = await createTestCategory();
      const product  = await createTestProduct({ categoryId: category.id });

      const res = await api.get(`/api/products/${product.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(product.id);
      expect(res.body.data.images).toBeDefined();
      expect(res.body.data.category).toBeDefined();
    });

    it('mövcud olmayan slug — 404', async () => {
      const res = await api.get('/api/products/yoxdur-bele-mehsul');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });
  });

  // ── POST /api/products ────────────────────────────────────
  describe('POST /api/products', () => {
    it('Admin məhsul yarada bilər', async () => {
      const admin    = await createTestAdmin();
      const category = await createTestCategory();

      const res = await api
        .post('/api/products')
        .set(getAuthHeader(admin))
        .send({
          name:        'Yeni Test Məhsul',
          description: 'Ətraflı açıqlama buradadır',
          price:       199.99,
          sku:         'NEW-SKU-001',
          stock:       50,
          categoryId:  category.id,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('yeni-test-mehsul');
    });

    it('Vendor məhsul yarada bilər', async () => {
      const { user: vendor } = await createTestVendor();
      const category          = await createTestCategory();

      const res = await api
        .post('/api/products')
        .set(getAuthHeader(vendor))
        .send({
          name:        'Vendor Məhsulu',
          description: 'Vendor tərəfindən yaradılan məhsul',
          price:       99.99,
          sku:         'VENDOR-SKU-001',
          stock:       20,
          categoryId:  category.id,
        });

      expect(res.status).toBe(201);
    });

    it('Customer məhsul yarada bilməz — 403', async () => {
      const customer = await createTestCustomer();
      const category = await createTestCategory();

      const res = await api
        .post('/api/products')
        .set(getAuthHeader(customer))
        .send({
          name: 'Olmayacaq', description: 'Test',
          price: 1, sku: 'X', stock: 1, categoryId: category.id,
        });

      expect(res.status).toBe(403);
    });

    it('Token olmadan — 401', async () => {
      const res = await api.post('/api/products').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });

    it('Məcburi sahə çatışmırsa — 400', async () => {
      const admin = await createTestAdmin();
      const res   = await api
        .post('/api/products')
        .set(getAuthHeader(admin))
        .send({ name: 'Qiymət yoxdur' });   // price yoxdur

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  // ── DELETE /api/products/:id ──────────────────────────────
  describe('DELETE /api/products/:id', () => {
    it('Admin istənilən məhsulu silə bilər', async () => {
      const admin    = await createTestAdmin();
      const category = await createTestCategory();
      const product  = await createTestProduct({ categoryId: category.id });

      const res = await api
        .delete(`/api/products/${product.id}`)
        .set(getAuthHeader(admin));

      expect(res.status).toBe(200);
    });

    it('Vendor yalnız öz məhsulunu silə bilər', async () => {
      const { user: vendor1 } = await createTestVendor();
      const { user: vendor2 } = await createTestVendor();
      const category           = await createTestCategory();
      const product            = await createTestProduct({ categoryId: category.id });

      const res = await api
        .delete(`/api/products/${product.id}`)
        .set(getAuthHeader(vendor2));

      expect(res.status).toBe(403);
    });
  });
});
```

---

### 4.3 Sifariş Endpointləri

```typescript
// src/__tests__/integration/orders.test.ts

import {
  api, createTestCustomer, createTestAdmin,
  createTestProduct, createTestCategory,
  createTestAddress, getAuthHeader,
} from '../helpers/testHelpers';

describe('ORDERS API', () => {

  // ── POST /api/orders ──────────────────────────────────────
  describe('POST /api/orders (sifariş yarat)', () => {
    it('səbəti olan customer sifariş yarada bilər', async () => {
      const customer = await createTestCustomer();
      const address  = await createTestAddress(customer.id);
      const category = await createTestCategory();
      const product  = await createTestProduct({ categoryId: category.id });

      // Səbətə məhsul əlavə et
      await prisma.cart.create({
        data: {
          userId: customer.id,
          items: {
            create: [{ productId: product.id, quantity: 2 }],
          },
        },
      });

      const res = await api
        .post('/api/orders')
        .set(getAuthHeader(customer))
        .send({ addressId: address.id });

      expect(res.status).toBe(201);
      expect(res.body.data.orderNumber).toMatch(/^ORD-/);
      expect(res.body.data.total).toBeDefined();
    });

    it('boş səbətlə sifariş verilə bilməz — 422', async () => {
      const customer = await createTestCustomer();
      const address  = await createTestAddress(customer.id);

      const res = await api
        .post('/api/orders')
        .set(getAuthHeader(customer))
        .send({ addressId: address.id });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('CART_EMPTY');
    });

    it('stok kifayət deyilsə — 422 INSUFFICIENT_STOCK', async () => {
      const customer = await createTestCustomer();
      const address  = await createTestAddress(customer.id);
      const category = await createTestCategory();
      const product  = await createTestProduct({
        categoryId: category.id,
        stock:      1,
      });

      await prisma.cart.create({
        data: {
          userId: customer.id,
          items: {
            create: [{ productId: product.id, quantity: 5 }], // 5 > stok(1)
          },
        },
      });

      const res = await api
        .post('/api/orders')
        .set(getAuthHeader(customer))
        .send({ addressId: address.id });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('INSUFFICIENT_STOCK');
    });
  });

  // ── GET /api/orders/my ───────────────────────────────────
  describe('GET /api/orders/my', () => {
    it('customer öz sifarişlərini görə bilər', async () => {
      const customer = await createTestCustomer();

      const res = await api
        .get('/api/orders/my')
        .set(getAuthHeader(customer));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('token olmadan — 401', async () => {
      const res = await api.get('/api/orders/my');
      expect(res.status).toBe(401);
    });
  });
});
```

---

### 4.4 Kupon Testləri

```typescript
// src/__tests__/integration/coupons.test.ts

import { api, createTestAdmin, createTestCustomer, getAuthHeader } from '../helpers/testHelpers';

describe('COUPONS API', () => {

  describe('POST /api/coupons/validate', () => {
    beforeEach(async () => {
      const admin = await createTestAdmin();
      await prisma.coupon.create({
        data: {
          code:          'TEST20',
          type:          'PERCENTAGE',
          value:         20,
          minOrderValue: 100,
          isActive:      true,
        },
      });
    });

    it('etibarlı kupon — endirim hesablamalıdır', async () => {
      const customer = await createTestCustomer();
      const res = await api
        .post('/api/coupons/validate')
        .set(getAuthHeader(customer))
        .send({ code: 'TEST20', orderTotal: 200 });

      expect(res.status).toBe(200);
      expect(Number(res.body.data.discount)).toBe(40);       // 200 * 20% = 40
      expect(Number(res.body.data.finalTotal)).toBe(160);
    });

    it('minimum sifariş tələbi karşılanmırsa — 422', async () => {
      const customer = await createTestCustomer();
      const res = await api
        .post('/api/coupons/validate')
        .set(getAuthHeader(customer))
        .send({ code: 'TEST20', orderTotal: 50 }); // 50 < 100

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('COUPON_MIN_ORDER');
    });

    it('etibarsız kupon kodu — 422 COUPON_INVALID', async () => {
      const customer = await createTestCustomer();
      const res = await api
        .post('/api/coupons/validate')
        .set(getAuthHeader(customer))
        .send({ code: 'YOXDUR', orderTotal: 200 });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('COUPON_INVALID');
    });
  });
});
```

---

## 5. Frontend — Unit Testlər (Vitest)

### 5.1 Quraşdırma

```bash
cd client
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  jsdom \
  @vitejs/plugin-react
```

### 5.2 `vitest.config.ts`

```typescript
// client/vitest.config.ts

import { defineConfig } from 'vitest/config';
import react            from '@vitejs/plugin-react';
import path             from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  './src/__tests__/setup.ts',
    coverage: {
      provider:  'v8',
      reporter:  ['text', 'json', 'html'],
      thresholds: {
        branches:   70,
        functions:  80,
        lines:      80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

```typescript
// client/src/__tests__/setup.ts

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// next/navigation mock
vi.mock('next/navigation', () => ({
  useRouter:   () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/az',
  useSearchParams: () => new URLSearchParams(),
}));

// next/image mock
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// next-intl mock
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: Record<string, unknown>) => {
    if (vars) return `${key}(${JSON.stringify(vars)})`;
    return key;
  },
  useLocale: () => 'az',
}));
```

### 5.3 Zustand Store Testləri

```typescript
// src/__tests__/unit/stores/cartStore.test.ts

import { renderHook, act } from '@testing-library/react';
import { useCartStore }    from '@/store/cartStore';

const mockProduct = {
  id:    'prod_1',
  name:  'Test Məhsul',
  slug:  'test-mehsul',
  price: 99.99,
  stock: 10,
  image: { url: 'https://example.com/img.jpg', alt: 'Test' },
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('məhsul əlavə edilməlidir', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('eyni məhsul miqdarı artırılmalıdır', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, 1);
      result.current.addItem(mockProduct, 3);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(4);
  });

  it('məhsul silinməlidir', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, 1);
      result.current.removeItem('prod_1');
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('səbət təmizlənməlidir', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, 2);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('ümumi qiyməti düzgün hesablamalıdır', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, 3);
    });

    expect(result.current.total).toBeCloseTo(299.97, 2);
  });
});
```

### 5.4 Komponent Testləri

```typescript
// src/__tests__/unit/components/StarRating.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import StarRating                    from '@/components/shop/StarRating';

describe('StarRating komponenti', () => {
  it('reytinqi göstərməlidir', () => {
    render(<StarRating rating={4} count={50} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('interaktiv rejimdə klik işləməlidir', () => {
    const onChange = vi.fn();
    render(<StarRating rating={0} interactive onChange={onChange} />);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[2]);  // 3-cü ulduz

    expect(onChange).toHaveBeenCalledWith(3);
  });
});
```

```typescript
// src/__tests__/unit/components/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import Button                        from '@/components/common/Button';
import { ShoppingCart }              from 'lucide-react';

describe('Button komponenti', () => {
  it('məzmunu göstərməlidir', () => {
    render(<Button>Səbətə əlavə et</Button>);
    expect(screen.getByText('Səbətə əlavə et')).toBeInTheDocument();
  });

  it('onClick işləməlidir', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik et</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('isLoading zamanı disabled olmalıdır', () => {
    render(<Button isLoading>Göndər</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disabled prop işləməlidir', () => {
    render(<Button disabled>Deaktiv</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('ikon göstərməlidir', () => {
    render(
      <Button icon={<ShoppingCart data-testid="cart-icon" />}>
        Səbətə əlavə et
      </Button>
    );
    expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
  });
});
```

```typescript
// src/__tests__/unit/components/Badge.test.tsx

import { render, screen } from '@testing-library/react';
import Badge              from '@/components/common/Badge';

describe('Badge komponenti', () => {
  it('mətni göstərməlidir', () => {
    render(<Badge>Aktiv</Badge>);
    expect(screen.getByText('Aktiv')).toBeInTheDocument();
  });

  it('variant class-ı tətbiq etməlidir', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.firstChild).toHaveClass('bg-green');
  });
});
```

---

## 6. E2E Testlər (Playwright)

### 6.1 Quraşdırma

```bash
cd client
npm install --save-dev @playwright/test
npx playwright install chromium firefox
```

### 6.2 `playwright.config.ts`

```typescript
// client/playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:  './e2e',
  timeout:  30_000,
  retries:  process.env.CI ? 2 : 0,
  workers:  process.env.CI ? 1 : undefined,

  use: {
    baseURL:    'http://localhost:3000',
    locale:     'az',
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile',   use: { ...devices['iPhone 13'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url:     'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 6.3 Kritik E2E Axınları

```typescript
// e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Autentifikasiya axını', () => {
  test('qeydiyyat → giriş → çıxış', async ({ page }) => {
    // Qeydiyyat
    await page.goto('/az/register');
    await page.fill('[name="name"]',            'E2E Test İstifadəçi');
    await page.fill('[name="email"]',           'e2e@test.com');
    await page.fill('[name="password"]',        'Test@1234');
    await page.fill('[name="confirmPassword"]', 'Test@1234');
    await page.click('button[type="submit"]');

    // Dashboard-a yönləndirilir
    await expect(page).toHaveURL(/\/dashboard|\/az\//);

    // Çıxış
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL(/\/login/);
  });

  test('yanlış credentials ilə giriş', async ({ page }) => {
    await page.goto('/az/login');
    await page.fill('[name="email"]',    'wrong@test.com');
    await page.fill('[name="password"]', 'WrongPass');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/yanlış|incorrect/i)).toBeVisible();
  });
});
```

```typescript
// e2e/shopping.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Alış-veriş axını', () => {
  test('məhsul axtarış → səbət → checkout', async ({ page }) => {
    // Ana səhifə
    await page.goto('/az');

    // Məhsul axtarışı
    await page.fill('[data-testid="search-input"]', 'iPhone');
    await page.press('[data-testid="search-input"]', 'Enter');
    await expect(page).toHaveURL(/\/search\?q=iPhone/);

    // İlk məhsula klik
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page).toHaveURL(/\/products\//);

    // Səbətə əlavə et
    await page.click('[data-testid="add-to-cart-btn"]');
    await expect(page.getByText(/Səbətə əlavə edildi/)).toBeVisible();

    // Səbətə keç
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText('iPhone')).toBeVisible();

    // Checkout
    await page.click('[data-testid="checkout-btn"]');
    await expect(page).toHaveURL(/\/checkout|\/login/);
  });

  test('məhsul səhifəsinin SEO meta tag-ları yoxlanır', async ({ page }) => {
    await page.goto('/az/products/iphone-15-pro-256gb');

    const title = await page.title();
    expect(title).toContain('iPhone');
    expect(title).toContain('ShopFlow');

    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => el.getAttribute('href')
    );
    expect(canonical).toContain('/az/products/iphone-15-pro-256gb');

    const hreflangAz = await page.$eval(
      'link[hreflang="az"]',
      (el) => el.getAttribute('href')
    );
    expect(hreflangAz).toContain('/az/products/');
  });
});
```

---

## 7. Test Əmrləri

```bash
# ── Backend ───────────────────────────────────────────────
cd server

# Bütün testlər
npm run test

# Watch rejimi (development zamanı)
npm run test:watch

# Coverage report
npm run test:coverage

# CI üçün
npm run test:ci

# Spesifik fayl
npx jest src/__tests__/integration/auth.test.ts

# ── Frontend ──────────────────────────────────────────────
cd client

# Bütün testlər
npm run test

# Watch rejimi
npm run test:watch

# Coverage
npm run test:coverage

# ── E2E ──────────────────────────────────────────────────
cd client

# Bütün E2E testlər (UI açılır)
npx playwright test

# Headless rejim (CI)
npx playwright test --headed=false

# Yalnız bir axın
npx playwright test e2e/shopping.spec.ts

# HTML report
npx playwright show-report
```

---

## 8. Test Qaydaları

```
BACKEND
  ✅  Hər endpoint üçün ən az 1 uğurlu + 1 uğursuz test
  ✅  Auth yoxlaması: token var, yox, yanlış rol
  ✅  Validasiya xətaları test edilir
  ✅  Prisma əməliyyatları real test DB-də
  ✅  beforeEach cədvəlləri təmizlər
  ❌  Production DB-yə test yazma
  ❌  JWT_SECRET hardcode (process.env istifadə et)

FRONTEND
  ✅  Hər komponent üçün render testi
  ✅  İstifadəçi qarşılıqlı əlaqəsi (klik, input)
  ✅  Edge case-lər (boş state, error state, loading)
  ✅  Zustand store-lar unit test edilir
  ❌  İmplementasiya detallarını test et (CSS class)
  ❌  Snapshot testlər (köhnəlir tez)

E2E
  ✅  Yalnız kritik iş axınları
  ✅  Login → alış-veriş → sifariş tam axın
  ✅  SEO meta tag-ları yoxlanır
  ❌  Hər UI elementi üçün E2E (çox yavaş)

ÜMUMI
  ✅  Test faylı: ModulAdı.test.ts formatı
  ✅  describe/it adları Azərbaycan dilində (oxunaqlı)
  ✅  AAA pattern: Arrange → Act → Assert
  ✅  Helper funksiyalar testHelpers.ts-də
  ✅  Coverage: backend 80%+, frontend 80%+
```
