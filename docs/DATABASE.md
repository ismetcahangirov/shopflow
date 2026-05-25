# DATABASE.md — Verilənlər Bazası Sənədləşməsi

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Ümumi Baxış

| Parametr | Dəyər |
|---|---|
| **Verilənlər bazası** | PostgreSQL 16 |
| **ORM** | Prisma 5 |
| **Hosting** | Supabase (pulsuz 500MB, limitsiz müddət) |
| **Connection** | Prisma connection pooling (PgBouncer) |
| **Migration** | Prisma Migrate (avtomatik SQL generasiya) |
| **Studio** | Prisma Studio — vizual DB idarəsi |

---

## 2. Supabase Qurulumu

```
1. supabase.com → "New Project" yarat
2. Ad: shopflow-db
3. Şifrə: [güclü şifrə — saxla!]
4. Region: Frankfurt (EU) — Render ilə yaxın
5. "Create new project" → ~2 dəqiqə gözlə

6. Settings → Database → Connection string → "URI" tab
7. DATABASE_URL-i kopyala:
   postgresql://postgres:[şifrə]@db.[project-id].supabase.co:5432/postgres

8. server/.env faylına əlavə et:
   DATABASE_URL="postgresql://postgres:..."
   DIRECT_URL="postgresql://postgres:..."    ← Migration üçün (PgBouncer bypass)
```

**`prisma/schema.prisma` üçün:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // Supabase PgBouncer ilə migration üçün vacib
}
```

---

## 3. Tam Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────────────────
// ENUM-LAR
// ─────────────────────────────────────────

enum Role {
  ADMIN
  VENDOR
  CUSTOMER
}

enum OrderStatus {
  PENDING       // Gözləyir
  CONFIRMED     // Təsdiqləndi
  PROCESSING    // Hazırlanır
  SHIPPED       // Göndərildi
  DELIVERED     // Çatdırıldı
  CANCELLED     // Ləğv edildi
  REFUNDED      // Geri qaytarıldı
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
  PARTIALLY_REFUNDED
}

enum CouponType {
  PERCENTAGE    // 20% endirim
  FIXED_AMOUNT  // 10 AZN endirim
}

enum VendorStatus {
  PENDING       // Təsdiq gözləyir
  APPROVED      // Təsdiqlənib
  REJECTED      // Rədd edilib
  SUSPENDED     // Dayandırılıb
}

// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?                          // Google OAuth-da null
  role          Role      @default(CUSTOMER)
  avatar        String?                          // Cloudinary URL
  googleId      String?   @unique
  isActive      Boolean   @default(true)
  isVerified    Boolean   @default(false)
  verifyToken   String?
  resetToken    String?
  resetTokenExp DateTime?
  refreshToken  String?
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // İlişkilər
  orders        Order[]
  reviews       Review[]
  wishlist      WishlistItem[]
  addresses     Address[]
  cart          Cart?
  vendor        Vendor?

  @@index([email])
  @@index([role])
  @@index([googleId])
  @@map("users")
}

// ─────────────────────────────────────────
// VENDOR (Satıcı Mağazası)
// ─────────────────────────────────────────

model Vendor {
  id          String       @id @default(cuid())
  storeName   String
  slug        String       @unique
  description String?
  logo        String?                             // Cloudinary URL
  banner      String?                             // Cloudinary URL
  phone       String?
  address     String?
  status      VendorStatus @default(PENDING)
  commission  Float        @default(10.0)         // % komissiya
  totalSales  Decimal      @default(0) @db.Decimal(12, 2)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // İlişkilər
  userId      String       @unique
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  products    Product[]

  @@index([slug])
  @@index([status])
  @@map("vendors")
}

// ─────────────────────────────────────────
// CATEGORY (Kateqoriya Ağacı)
// ─────────────────────────────────────────

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?                             // Cloudinary URL
  isActive    Boolean    @default(true)
  sortOrder   Int        @default(0)
  metaTitle   String?                             // SEO
  metaDesc    String?                             // SEO
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Özünə referans — üst/alt kateqoriyalar
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")

  // İlişkilər
  products    Product[]

  @@index([slug])
  @@index([parentId])
  @@index([isActive])
  @@map("categories")
}

// ─────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────

model Product {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String
  shortDesc     String?                           // Siyahıda göstərilən qısa təsvir
  price         Decimal   @db.Decimal(10, 2)
  comparePrice  Decimal?  @db.Decimal(10, 2)     // Köhnə qiymət (cızıqlı)
  costPrice     Decimal?  @db.Decimal(10, 2)     // Maya dəyəri (admin görür)
  sku           String    @unique
  barcode       String?
  stock         Int       @default(0)
  lowStockAlert Int       @default(5)             // Bu qədər qalınca xəbər ver
  weight        Float?                            // Çatdırılma üçün (kq)
  brand         String?
  isActive      Boolean   @default(true)
  isFeatured    Boolean   @default(false)         // Ana səhifədə göstər
  tags          String[]                          // ["telefon", "apple", "5g"]
  avgRating     Float     @default(0)
  reviewCount   Int       @default(0)
  salesCount    Int       @default(0)
  metaTitle     String?                           // SEO
  metaDesc      String?                           // SEO
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Foreign keys
  categoryId    String
  vendorId      String?

  // İlişkilər
  category      Category          @relation(fields: [categoryId], references: [id])
  vendor        Vendor?           @relation(fields: [vendorId], references: [id])
  images        ProductImage[]
  attributes    ProductAttribute[]
  variants      ProductVariant[]
  reviews       Review[]
  orderItems    OrderItem[]
  wishlist      WishlistItem[]
  cartItems     CartItem[]

  @@index([slug])
  @@index([categoryId])
  @@index([vendorId])
  @@index([isActive, isFeatured])
  @@index([price])
  @@index([avgRating])
  @@index([salesCount])
  @@map("products")
}

model ProductImage {
  id        String  @id @default(cuid())
  url       String                                // Cloudinary URL
  alt       String?                               // SEO alt mətn
  sortOrder Int     @default(0)
  isMain    Boolean @default(false)

  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@map("product_images")
}

model ProductAttribute {
  id        String  @id @default(cuid())
  name      String  // "Rəng", "Ölçü", "Material"
  value     String  // "Qırmızı", "XL", "Pambıq"

  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_attributes")
}

model ProductVariant {
  id       String  @id @default(cuid())
  name     String  // "Qırmızı / XL"
  sku      String  @unique
  price    Decimal @db.Decimal(10, 2)
  stock    Int     @default(0)
  image    String?

  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@map("product_variants")
}

// ─────────────────────────────────────────
// ORDER (Sifariş)
// ─────────────────────────────────────────

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique             // "ORD-20260001"
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentMethod   String?                           // "stripe", "cash_on_delivery"
  stripePaymentId String?                           // Stripe PaymentIntent ID
  stripeSessionId String?                           // Stripe Checkout Session ID
  subtotal        Decimal       @db.Decimal(10, 2)
  shippingCost    Decimal       @db.Decimal(10, 2) @default(0)
  discount        Decimal       @db.Decimal(10, 2) @default(0)
  tax             Decimal       @db.Decimal(10, 2) @default(0)
  total           Decimal       @db.Decimal(10, 2)
  notes           String?                           // Müştəri qeydi
  trackingNumber  String?                           // Kargo izləmə
  shippedAt       DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?
  cancelReason    String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Foreign keys
  userId          String
  addressId       String
  couponId        String?

  // İlişkilər
  user            User          @relation(fields: [userId], references: [id])
  address         Address       @relation(fields: [addressId], references: [id])
  coupon          Coupon?       @relation(fields: [couponId], references: [id])
  items           OrderItem[]
  statusHistory   OrderStatusHistory[]

  @@index([userId])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
  @@index([orderNumber])
  @@map("orders")
}

model OrderItem {
  id          String  @id @default(cuid())
  quantity    Int
  price       Decimal @db.Decimal(10, 2)           // Sifariş anındakı qiymət
  total       Decimal @db.Decimal(10, 2)
  productName String                                // Məhsul sonradan silinə bilər
  productSku  String

  orderId     String
  productId   String?                               // null ola bilər (silinib)

  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

model OrderStatusHistory {
  id        String      @id @default(cuid())
  status    OrderStatus
  note      String?
  createdAt DateTime    @default(now())

  orderId   String
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@map("order_status_history")
}

// ─────────────────────────────────────────
// CART (Səbət)
// ─────────────────────────────────────────

model Cart {
  id        String     @id @default(cuid())
  updatedAt DateTime   @updatedAt

  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]

  @@map("carts")
}

model CartItem {
  id        String   @id @default(cuid())
  quantity  Int      @default(1)
  createdAt DateTime @default(now())

  cartId    String
  productId String

  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])
  @@index([cartId])
  @@map("cart_items")
}

// ─────────────────────────────────────────
// REVIEW (Rəy)
// ─────────────────────────────────────────

model Review {
  id          String   @id @default(cuid())
  rating      Int                                   // 1-5
  title       String?
  body        String
  isApproved  Boolean  @default(false)              // Admin moderasiya
  isVerified  Boolean  @default(false)              // Alqı təsdiqlənib
  helpfulCount Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId      String
  productId   String

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])                     // Bir istifadəçi → bir rəy
  @@index([productId, isApproved])
  @@index([userId])
  @@map("reviews")
}

// ─────────────────────────────────────────
// COUPON (Kupon / Endirim Kodu)
// ─────────────────────────────────────────

model Coupon {
  id            String     @id @default(cuid())
  code          String     @unique                  // "SUMMER20"
  type          CouponType
  value         Decimal    @db.Decimal(10, 2)       // 20 (%) ya da 10 (AZN)
  minOrderValue Decimal?   @db.Decimal(10, 2)       // Minimum sifariş məbləği
  maxDiscount   Decimal?   @db.Decimal(10, 2)       // Maksimum endirim məbləği
  maxUses       Int?                                // Null = limitsiz
  usedCount     Int        @default(0)
  isActive      Boolean    @default(true)
  startsAt      DateTime?
  expiresAt     DateTime?
  createdAt     DateTime   @default(now())

  orders        Order[]

  @@index([code])
  @@index([isActive])
  @@map("coupons")
}

// ─────────────────────────────────────────
// WISHLIST (İstək Siyahısı)
// ─────────────────────────────────────────

model WishlistItem {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  productId String

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@index([userId])
  @@map("wishlist_items")
}

// ─────────────────────────────────────────
// ADDRESS (Çatdırılma Ünvanı)
// ─────────────────────────────────────────

model Address {
  id        String   @id @default(cuid())
  fullName  String
  phone     String
  city      String
  district  String
  street    String
  building  String?
  apartment String?
  zip       String?
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders    Order[]

  @@index([userId])
  @@map("addresses")
}

// ─────────────────────────────────────────
// SETTINGS (Sayt Parametrləri)
// ─────────────────────────────────────────

model Setting {
  id        String   @id @default(cuid())
  key       String   @unique                        // "site_name", "currency", "shipping_cost"
  value     String
  group     String   @default("general")            // "general", "payment", "email"
  updatedAt DateTime @updatedAt

  @@index([key])
  @@index([group])
  @@map("settings")
}
```

---

## 4. Migration Əmrləri

```bash
# ── İlk qurulum ───────────────────────────────────────────
cd server

# .env-dəki DATABASE_URL və DIRECT_URL-i yoxla
npx prisma validate            # Schema xətası var?

# İlk migrasiya — cədvəlləri yarat
npx prisma migrate dev --name init

# ── Gündəlik iş ──────────────────────────────────────────

# Schema dəyişdikdən sonra yeni migrasiya
npx prisma migrate dev --name add_product_variant

# Migrasiya adlandırma nümunələri:
npx prisma migrate dev --name add_user_phone
npx prisma migrate dev --name create_coupon_table
npx prisma migrate dev --name add_product_tags_index
npx prisma migrate dev --name rename_wishlist_to_wishlist_items

# ── Production ────────────────────────────────────────────

# Production-da deploy zamanı (CI/CD-də)
npx prisma migrate deploy       # dev əmrini HEÇ VAXT production-da işlətmə

# ── Yardımçı əmrlər ──────────────────────────────────────

npx prisma studio               # localhost:5555 — vizual DB idarəsi
npx prisma db seed              # Seed data doldur
npx prisma generate             # Prisma Client yenilə (schema dəyişdikdə)
npx prisma format               # schema.prisma-nı formatla
npx prisma db push              # Migration yaratmadan birbaşa tətbiq et (yalnız dev)

# ── Sıfırlama (DIQQƏT: bütün data silinir!) ───────────────
npx prisma migrate reset        # Bütün cədvəlləri sil, yenidən yarat, seed et
```

---

## 5. Prisma Client Konfiqurasiyası

```typescript
// src/config/db.ts

import { PrismaClient } from '@prisma/client';

// Global-da saxla — Next.js hot reload zamanı çoxlu bağlantı açılmasın
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Bağlantını yoxla
export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL bağlantısı uğurludur');
  } catch (error) {
    console.error('❌ PostgreSQL bağlantısı uğursuz:', error);
    process.exit(1);
  }
}

// Graceful shutdown
export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
```

```typescript
// src/server.ts — bağlantı

import { connectDB, disconnectDB } from './config/db';

async function main() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    server.close();
    await disconnectDB();
    process.exit(0);
  });
}

main();
```

---

## 6. Seed Data

```typescript
// prisma/seed.ts

import { PrismaClient, Role, CouponType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed data əlavə edilir...');

  // ── Admin istifadəçi ───────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@shopflow.az' },
    update: {},
    create: {
      name:       'ShopFlow Admin',
      email:      'admin@shopflow.az',
      password:   adminPassword,
      role:       Role.ADMIN,
      isActive:   true,
      isVerified: true,
    },
  });
  console.log('✅ Admin yaradıldı:', admin.email);

  // ── Test Customer ─────────────────────────────────────
  const customerPassword = await bcrypt.hash('Customer@1234', 12);
  const customer = await prisma.user.upsert({
    where:  { email: 'customer@test.az' },
    update: {},
    create: {
      name:       'Test Müştəri',
      email:      'customer@test.az',
      password:   customerPassword,
      role:       Role.CUSTOMER,
      isActive:   true,
      isVerified: true,
    },
  });
  console.log('✅ Customer yaradıldı:', customer.email);

  // ── Test Vendor ───────────────────────────────────────
  const vendorPassword = await bcrypt.hash('Vendor@1234', 12);
  const vendorUser = await prisma.user.upsert({
    where:  { email: 'vendor@test.az' },
    update: {},
    create: {
      name:       'Test Vendor',
      email:      'vendor@test.az',
      password:   vendorPassword,
      role:       Role.VENDOR,
      isActive:   true,
      isVerified: true,
      vendor: {
        create: {
          storeName:  'Tech Mağazası',
          slug:       'tech-magazasi',
          description:'Ən yeni texnologiya məhsulları',
          status:     'APPROVED',
          commission: 10.0,
        },
      },
    },
    include: { vendor: true },
  });
  console.log('✅ Vendor yaradıldı:', vendorUser.email);

  // ── Kateqoriyalar ─────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where:  { slug: 'elektronika' },
    update: {},
    create: {
      name:      'Elektronika',
      slug:      'elektronika',
      sortOrder: 1,
      isActive:  true,
    },
  });

  const phones = await prisma.category.upsert({
    where:  { slug: 'telefonlar' },
    update: {},
    create: {
      name:      'Telefonlar',
      slug:      'telefonlar',
      parentId:  electronics.id,
      sortOrder: 1,
      isActive:  true,
    },
  });

  const clothing = await prisma.category.upsert({
    where:  { slug: 'geyim' },
    update: {},
    create: {
      name:      'Geyim',
      slug:      'geyim',
      sortOrder: 2,
      isActive:  true,
    },
  });

  await prisma.category.upsert({
    where:  { slug: 'ev-ve-bag' },
    update: {},
    create: {
      name:      'Ev və Bağ',
      slug:      'ev-ve-bag',
      sortOrder: 3,
      isActive:  true,
    },
  });

  console.log('✅ Kateqoriyalar yaradıldı');

  // ── Məhsullar ─────────────────────────────────────────
  const vendor = await prisma.vendor.findUnique({
    where: { userId: vendorUser.id },
  });

  const product1 = await prisma.product.upsert({
    where:  { slug: 'iphone-15-pro-256gb' },
    update: {},
    create: {
      name:         'iPhone 15 Pro 256GB',
      slug:         'iphone-15-pro-256gb',
      description:  'Apple iPhone 15 Pro 256GB Natural Titanium. A17 Pro çip, 48MP kamera sistemi.',
      shortDesc:    'Apple A17 Pro çip, 48MP kamera, Titanium dizayn',
      price:        2499.99,
      comparePrice: 2799.99,
      sku:          'IPH15PRO-256-TI',
      stock:        50,
      brand:        'Apple',
      isFeatured:   true,
      tags:         ['telefon', 'apple', 'iphone', '5g'],
      categoryId:   phones.id,
      vendorId:     vendor!.id,
      images: {
        create: [
          {
            url:      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            alt:      'iPhone 15 Pro öndan görünüş',
            isMain:   true,
            sortOrder: 0,
          },
        ],
      },
      attributes: {
        create: [
          { name: 'Rəng',        value: 'Natural Titanium' },
          { name: 'Yaddaş',      value: '256GB' },
          { name: 'RAM',         value: '8GB' },
          { name: 'Ekran',       value: '6.1 düym Super Retina XDR' },
          { name: 'Batareya',    value: '3274 mAh' },
          { name: 'OS',          value: 'iOS 17' },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where:  { slug: 'samsung-galaxy-s24-ultra' },
    update: {},
    create: {
      name:         'Samsung Galaxy S24 Ultra',
      slug:         'samsung-galaxy-s24-ultra',
      description:  'Samsung Galaxy S24 Ultra 256GB Titanium Black. Snapdragon 8 Gen 3 çip.',
      shortDesc:    'Snapdragon 8 Gen 3, 200MP kamera, S Pen daxil',
      price:        2299.99,
      comparePrice: 2599.99,
      sku:          'SGS24U-256-BK',
      stock:        30,
      brand:        'Samsung',
      isFeatured:   true,
      tags:         ['telefon', 'samsung', 'android', '5g'],
      categoryId:   phones.id,
      vendorId:     vendor!.id,
      images: {
        create: [{
          url:    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          alt:    'Samsung Galaxy S24 Ultra',
          isMain: true,
        }],
      },
      attributes: {
        create: [
          { name: 'Rəng',   value: 'Titanium Black' },
          { name: 'Yaddaş', value: '256GB' },
          { name: 'RAM',    value: '12GB' },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where:  { slug: 'nike-air-max-270' },
    update: {},
    create: {
      name:         'Nike Air Max 270',
      slug:         'nike-air-max-270',
      description:  'Nike Air Max 270 kişi idman ayaqqabısı. 270 dərəcəlik Air unit.',
      shortDesc:    '270° Air cushioning, yüngül dizayn',
      price:        249.99,
      sku:          'NIKE-AM270-42',
      stock:        100,
      brand:        'Nike',
      tags:         ['ayaqqabı', 'nike', 'idman', 'kişi'],
      categoryId:   clothing.id,
      images: {
        create: [{
          url:    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          alt:    'Nike Air Max 270',
          isMain: true,
        }],
      },
      attributes: {
        create: [
          { name: 'Ölçü',   value: '42' },
          { name: 'Rəng',   value: 'Ağ/Qara' },
          { name: 'Cins',   value: 'Kişi' },
        ],
      },
    },
  });

  console.log('✅ Məhsullar yaradıldı');

  // ── Kupon ─────────────────────────────────────────────
  await prisma.coupon.upsert({
    where:  { code: 'WELCOME10' },
    update: {},
    create: {
      code:         'WELCOME10',
      type:         CouponType.PERCENTAGE,
      value:        10,
      minOrderValue: 50,
      maxUses:      1000,
      isActive:     true,
    },
  });

  await prisma.coupon.upsert({
    where:  { code: 'SAVE50' },
    update: {},
    create: {
      code:         'SAVE50',
      type:         CouponType.FIXED_AMOUNT,
      value:        50,
      minOrderValue: 300,
      isActive:     true,
    },
  });

  console.log('✅ Kuponlar yaradıldı');

  // ── Sayt Parametrləri ─────────────────────────────────
  const settings = [
    { key: 'site_name',      value: 'ShopFlow',  group: 'general' },
    { key: 'site_email',     value: 'info@shopflow.az', group: 'general' },
    { key: 'currency',       value: 'AZN',       group: 'general' },
    { key: 'currency_symbol',value: '₼',         group: 'general' },
    { key: 'shipping_cost',  value: '5.00',      group: 'shipping' },
    { key: 'free_shipping_min', value: '100',    group: 'shipping' },
    { key: 'tax_rate',       value: '18',        group: 'payment' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where:  { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Parametrlər yaradıldı');

  // ── Test Ünvan ────────────────────────────────────────
  await prisma.address.create({
    data: {
      fullName:  'Test Müştəri',
      phone:     '+994501234567',
      city:      'Bakı',
      district:  'Nəsimi',
      street:    'Nizami küçəsi 10',
      building:  '5A',
      apartment: '12',
      isDefault: true,
      userId:    customer.id,
    },
  });

  console.log('✅ Ünvan yaradıldı');
  console.log('\n🎉 Seed tamamlandı!');
  console.log('─────────────────────────────────');
  console.log('Admin:    admin@shopflow.az / Admin@1234');
  console.log('Customer: customer@test.az / Customer@1234');
  console.log('Vendor:   vendor@test.az   / Vendor@1234');
  console.log('─────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed xətası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**`package.json`-a əlavə et:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 7. PostgreSQL İndekslər (Performans)

Bütün indekslər `schema.prisma`-da `@@index` ilə elan edilir — Prisma avtomatik yaradır.

```
CƏDVƏl          İNDEKS                          SƏBƏB
────────────     ──────────────────────────      ────────────────────────────────
users            email                           Login sorğusu
users            role                            Admin: role filter
users            googleId                        OAuth callback

products         slug                            URL → məhsul tapma
products         categoryId                      Kateqoriya filteri
products         isActive, isFeatured            Ana səhifə sorğusu
products         price                           Qiymət aralığı filteri
products         avgRating                       Reytinqə görə sıralama
products         salesCount                      Populyar məhsullar

orders           userId                          "Sifarişlərim" sorğusu
orders           status                          Admin: status filter
orders           paymentStatus                   Stripe webhook sorğusu
orders           createdAt                       Tarixə görə sıralama
orders           orderNumber                     Sifariş axtarışı

categories       slug                            URL → kateqoriya
categories       parentId                        Alt kateqoriyalar
categories       isActive                        Aktiv filter

reviews          productId, isApproved           Məhsul rəyləri
cart_items       cartId                          Səbət məzmunu
wishlist_items   userId                          İstək siyahısı
```

---

## 8. Faydalı Prisma Sorğu Nümunələri

```typescript
// ── Məhsul siyahısı — filter + sort + pagination ──────
const products = await prisma.product.findMany({
  where: {
    isActive:   true,
    categoryId: 'cat_123',
    price:      { gte: 100, lte: 500 },
    brand:      { in: ['Apple', 'Samsung'] },
    stock:      { gt: 0 },                     // Stokda olanlar
  },
  include: {
    images:   { where: { isMain: true }, take: 1 },
    category: { select: { name: true, slug: true } },
  },
  orderBy: { avgRating: 'desc' },
  skip:    0,
  take:    20,
});

// ── Full-text axtarış ─────────────────────────────────
const results = await prisma.product.findMany({
  where: {
    isActive: true,
    OR: [
      { name:        { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { brand:       { contains: query, mode: 'insensitive' } },
      { tags:        { has: query } },
    ],
  },
});

// ── Sifariş yaratma — transaction ────────────────────
const order = await prisma.$transaction(async (tx) => {
  // 1. Stok yoxla
  for (const item of cartItems) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
    });
    if (!product || product.stock < item.quantity) {
      throw new Error(`${product?.name} məhsulu stokda yoxdur`);
    }
  }

  // 2. Sifarişi yarat
  const newOrder = await tx.order.create({
    data: {
      orderNumber:  generateOrderNumber(),
      userId,
      addressId,
      subtotal,
      total,
      items: {
        create: cartItems.map((item) => ({
          productId:   item.productId,
          quantity:    item.quantity,
          price:       item.price,
          total:       item.price * item.quantity,
          productName: item.name,
          productSku:  item.sku,
        })),
      },
    },
  });

  // 3. Stoku azalt
  for (const item of cartItems) {
    await tx.product.update({
      where: { id: item.productId },
      data:  { stock: { decrement: item.quantity } },
    });
  }

  // 4. Səbəti təmizlə
  await tx.cart.update({
    where: { userId },
    data:  { items: { deleteMany: {} } },
  });

  return newOrder;
});

// ── Dashboard statistika ──────────────────────────────
const [totalOrders, totalRevenue, totalProducts, totalCustomers] =
  await prisma.$transaction([
    prisma.order.count({ where: { paymentStatus: 'PAID' } }),
    prisma.order.aggregate({
      where:   { paymentStatus: 'PAID' },
      _sum:    { total: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
  ]);

// ── Rəy əlavə ediləndə məhsul reytinqini yenilə ──────
await prisma.$transaction(async (tx) => {
  await tx.review.create({ data: reviewData });

  const stats = await tx.review.aggregate({
    where:  { productId, isApproved: true },
    _avg:   { rating: true },
    _count: { rating: true },
  });

  await tx.product.update({
    where: { id: productId },
    data: {
      avgRating:   stats._avg.rating ?? 0,
      reviewCount: stats._count.rating,
    },
  });
});
```

---

## 9. Backup Strategiyası

```
Supabase pulsuz planda:
  • Avtomatik günlük backup — YOX
  • Manual export — Bəli (SQL dump)

Manual backup (hər həftə):
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

Supabase Dashboard-dan:
  Settings → Database → Backups (Pro plan-da avtomatik)

Tövsiyə — production üçün:
  • Supabase Pro ($25/ay) — avtomatik günlük backup, PITR
  və ya
  • pg_dump + Cron Job + Cloudinary/S3-ə yüklə
```

---

## 10. Sürətli Keçid

| Ehtiyac | Hərəkət |
|---|---|
| Yeni cədvəl əlavə et | `schema.prisma` → `npx prisma migrate dev --name ...` |
| Mövcud cədvəli dəyiş | `schema.prisma` → `npx prisma migrate dev --name ...` |
| Test data doldur | `npx prisma db seed` |
| DB-ni vizual gör | `npx prisma studio` |
| Client-i yenilə | `npx prisma generate` |
| Production migration | `npx prisma migrate deploy` |
| Supabase bağlantı xətası | `DIRECT_URL`-i yoxla (PgBouncer bypass) |
