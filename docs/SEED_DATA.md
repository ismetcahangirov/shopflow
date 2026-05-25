# SEED_DATA.md — Seed Data Kataloqu

> **Layihə:** ShopFlow E-Commerce Platform
> **Bu fayl nədir:** `prisma/seed.ts` faylını yazarkən AI agent buradan real Azərbaycan məlumatlarını götürür.
> **Məqsəd:** Lokal inkişaf və demo üçün inandırıcı, Azərbaycana uyğun test datası.

---

## İstifadə Qaydası (Agent üçün)

```
1. seed.ts yazarkən bu faylı oxu
2. Aşağıdakı datanı olduğu kimi istifadə et — uydurma
3. Şifrələri bcryptjs ilə hashla (salt: 12)
4. Slug-ları slugify() utility ilə yarat
5. Seed sonrası: npx prisma db seed
```

---

## 👤 İstifadəçilər (Users)

### Admin
```typescript
{
  name:       'Anar Həsənov',
  email:      'admin@shopflow.az',
  password:   'Admin@2026!',        // hashla
  role:       'ADMIN',
  isVerified: true,
  isActive:   true,
}
```

### Vendorlar
```typescript
[
  {
    name:       'Nigar Məmmədova',
    email:      'nigar@techstore.az',
    password:   'Vendor@2026!',
    role:       'VENDOR',
    isVerified: true,
    isActive:   true,
    vendor: {
      storeName:   'TechStore AZ',
      slug:        'techstore-az',
      description: 'Azərbaycanda ən böyük elektronika mağazası. Apple, Samsung, Xiaomi rəsmi distribütoru.',
      status:      'APPROVED',
    }
  },
  {
    name:       'Rauf Əliyev',
    email:      'rauf@modaevi.az',
    password:   'Vendor@2026!',
    role:       'VENDOR',
    isVerified: true,
    isActive:   true,
    vendor: {
      storeName:   'Moda Evi',
      slug:        'moda-evi',
      description: 'Kişi və qadın geyimləri. Türkiyə və Avropa brendləri.',
      status:      'APPROVED',
    }
  },
]
```

### Müştərilər
```typescript
[
  {
    name:       'Leyla Quliyeva',
    email:      'leyla@gmail.com',
    password:   'Customer@2026!',
    role:       'CUSTOMER',
    isVerified: true,
    isActive:   true,
  },
  {
    name:       'Murad Babayev',
    email:      'murad@gmail.com',
    password:   'Customer@2026!',
    role:       'CUSTOMER',
    isVerified: true,
    isActive:   true,
  },
  {
    name:       'Günel İsmayılova',
    email:      'gunel@gmail.com',
    password:   'Customer@2026!',
    role:       'CUSTOMER',
    isVerified: false,
    isActive:   true,
  },
]
```

---

## 📁 Kateqoriyalar (Categories)

### Ana Kateqoriyalar
```typescript
[
  { name: 'Elektronika',    slug: 'elektronika',    sortOrder: 1 },
  { name: 'Geyim',          slug: 'geyim',          sortOrder: 2 },
  { name: 'Ev və Bağ',      slug: 'ev-ve-bag',      sortOrder: 3 },
  { name: 'İdman',          slug: 'idman',          sortOrder: 4 },
  { name: 'Gözəllik',       slug: 'gozellik',       sortOrder: 5 },
  { name: 'Uşaq Dünyası',   slug: 'usaq-dunyasi',   sortOrder: 6 },
]
```

### Alt Kateqoriyalar (parentId bağlanacaq)
```typescript
// Elektronika altında
[
  { name: 'Smartfonlar',     slug: 'smartfonlar',      parent: 'elektronika' },
  { name: 'Noutbuklar',      slug: 'noutbuklar',       parent: 'elektronika' },
  { name: 'Planşetlər',      slug: 'plansetler',       parent: 'elektronika' },
  { name: 'Qulaqlıqlar',     slug: 'qulaqliqlar',      parent: 'elektronika' },
  { name: 'Smartsaatlar',    slug: 'smartsaatlar',     parent: 'elektronika' },
]

// Geyim altında
[
  { name: 'Kişi Geyimləri',  slug: 'kisi-geyimleri',  parent: 'geyim' },
  { name: 'Qadın Geyimləri', slug: 'qadin-geyimleri', parent: 'geyim' },
  { name: 'Ayaqqabılar',     slug: 'ayaqqabilar',     parent: 'geyim' },
]

// Ev və Bağ altında
[
  { name: 'Mətbəx',          slug: 'metbex',           parent: 'ev-ve-bag' },
  { name: 'Mebel',           slug: 'mebel',            parent: 'ev-ve-bag' },
  { name: 'Dekor',           slug: 'dekor',            parent: 'ev-ve-bag' },
]
```

---

## 📦 Məhsullar (Products)

### Elektronika məhsulları

```typescript
[
  {
    name:         'iPhone 15 Pro 256GB',
    slug:         'iphone-15-pro-256gb',
    description:  'Apple iPhone 15 Pro — titanium dizayn, A17 Pro çip, 48MP kamera sistemi. Azərbaycan rəsmi zəmanəti ilə.',
    shortDesc:    'A17 Pro çip, 48MP kamera, titanium korpus',
    price:        2299.00,
    comparePrice: 2499.00,
    costPrice:    1800.00,
    sku:          'APL-IP15P-256-BLK',
    stock:        15,
    brand:        'Apple',
    isFeatured:   true,
    tags:         ['iphone', 'apple', 'smartfon', '5g', 'pro'],
    category:     'smartfonlar',
    metaTitle:    'iPhone 15 Pro 256GB | ShopFlow',
    metaDesc:     'Apple iPhone 15 Pro 256GB Azərbaycanda rəsmi zəmanətlə. Ən yaxşı qiymət — 2299 AZN.',
  },
  {
    name:         'Samsung Galaxy S24 Ultra',
    slug:         'samsung-galaxy-s24-ultra',
    description:  'Samsung Galaxy S24 Ultra — 200MP kamera, S Pen daxil, 6.8" Dynamic AMOLED ekran. AI funksiyaları ilə.',
    shortDesc:    '200MP kamera, S Pen, 6.8" AMOLED',
    price:        2149.00,
    comparePrice: 2349.00,
    costPrice:    1700.00,
    sku:          'SAM-S24U-512-TIT',
    stock:        10,
    brand:        'Samsung',
    isFeatured:   true,
    tags:         ['samsung', 'galaxy', 'smartfon', '5g', 'ultra'],
    category:     'smartfonlar',
    metaTitle:    'Samsung Galaxy S24 Ultra | ShopFlow',
    metaDesc:     'Samsung Galaxy S24 Ultra Azərbaycanda. 200MP kamera, S Pen daxil — 2149 AZN.',
  },
  {
    name:         'MacBook Air M3 13"',
    slug:         'macbook-air-m3-13',
    description:  'Apple MacBook Air M3 çipli, 13.6" Liquid Retina ekran, 8GB RAM, 256GB SSD. Ultra yüngül, pil ömrü 18 saat.',
    shortDesc:    'M3 çip, 13.6" Retina, 18 saat pil',
    price:        2899.00,
    comparePrice: null,
    costPrice:    2300.00,
    sku:          'APL-MBA-M3-8-256',
    stock:        8,
    brand:        'Apple',
    isFeatured:   true,
    tags:         ['macbook', 'apple', 'noutbuk', 'm3', 'laptop'],
    category:     'noutbuklar',
    metaTitle:    'MacBook Air M3 13" | ShopFlow',
    metaDesc:     'Apple MacBook Air M3 Azərbaycanda — 2899 AZN. Rəsmi zəmanət.',
  },
  {
    name:         'Xiaomi Redmi Note 13 Pro',
    slug:         'xiaomi-redmi-note-13-pro',
    description:  'Xiaomi Redmi Note 13 Pro — 200MP kamera, 5000mAh batareya, 120Hz AMOLED ekran. Ən yaxşı büdcə seçimi.',
    shortDesc:    '200MP kamera, 5000mAh, 120Hz AMOLED',
    price:        549.00,
    comparePrice: 649.00,
    costPrice:    400.00,
    sku:          'XIA-RN13P-256-BLU',
    stock:        25,
    brand:        'Xiaomi',
    isFeatured:   false,
    tags:         ['xiaomi', 'redmi', 'smartfon', 'büdcə'],
    category:     'smartfonlar',
    metaTitle:    'Xiaomi Redmi Note 13 Pro | ShopFlow',
    metaDesc:     'Xiaomi Redmi Note 13 Pro Azərbaycanda — 549 AZN.',
  },
  {
    name:         'AirPods Pro 2-ci nəsil',
    slug:         'airpods-pro-2-nesil',
    description:  'Apple AirPods Pro 2-ci nəsil — aktiv səs-küy söndürmə, Şəffaflıq rejimi, USB-C şarj qutusu.',
    shortDesc:    'Aktiv ANC, USB-C, H2 çip',
    price:        499.00,
    comparePrice: 549.00,
    costPrice:    380.00,
    sku:          'APL-APP2-USBC',
    stock:        30,
    brand:        'Apple',
    isFeatured:   false,
    tags:         ['airpods', 'apple', 'qulaqlıq', 'anc', 'tws'],
    category:     'qulaqliqlar',
    metaTitle:    'AirPods Pro 2-ci nəsil | ShopFlow',
    metaDesc:     'Apple AirPods Pro 2 Azərbaycanda — 499 AZN. USB-C şarj.',
  },
]
```

### Geyim məhsulları

```typescript
[
  {
    name:         'Nike Air Force 1 \'07',
    slug:         'nike-air-force-1-07-ag',
    description:  'Nike Air Force 1 klassik ağ rəngdə. Dəri üst, Air yastıqlama, hər gün geyim üçün ideal.',
    shortDesc:    'Klassik dəri krosovka, Air yastıqlama',
    price:        259.00,
    comparePrice: 299.00,
    costPrice:    180.00,
    sku:          'NIK-AF1-WHT-42',
    stock:        20,
    brand:        'Nike',
    isFeatured:   true,
    tags:         ['nike', 'krosovka', 'ayaqqabı', 'klassik', 'ağ'],
    category:     'ayaqqabilar',
    metaTitle:    'Nike Air Force 1 07 | ShopFlow',
    metaDesc:     'Nike Air Force 1 klassik krosovka Azərbaycanda — 259 AZN.',
  },
  {
    name:         'Levi\'s 501 Original Jeans',
    slug:         'levis-501-original-jeans',
    description:  'Levi\'s 501 orijinal düz kəsim cins. 100% pambıq, klassik 5 cib dizaynı. Tünd göy.',
    shortDesc:    '100% pambıq, düz kəsim, tünd göy',
    price:        189.00,
    comparePrice: null,
    costPrice:    130.00,
    sku:          'LEV-501-32-34-DKBLU',
    stock:        35,
    brand:        'Levi\'s',
    isFeatured:   false,
    tags:         ['levis', 'cins', 'kişi', 'klassik'],
    category:     'kisi-geyimleri',
    metaTitle:    'Levi\'s 501 Original Jeans | ShopFlow',
    metaDesc:     'Levi\'s 501 Orijinal Jeans Azərbaycanda — 189 AZN.',
  },
]
```

---

## 🎟️ Kuponlar (Coupons)

```typescript
[
  {
    code:          'XOSGELMIS10',
    type:          'PERCENTAGE',
    value:         10,
    minOrderAmount: 50,
    maxUses:       1000,
    expiresAt:     '2026-12-31',
    description:   'İlk sifariş üçün 10% endirim',
  },
  {
    code:          'YAZI2026',
    type:          'PERCENTAGE',
    value:         15,
    minOrderAmount: 100,
    maxUses:       500,
    expiresAt:     '2026-08-31',
    description:   'Yay mövsümü 15% endirim',
  },
  {
    code:          'PULSUZ50',
    type:          'FIXED',
    value:         50,
    minOrderAmount: 300,
    maxUses:       200,
    expiresAt:     '2026-12-31',
    description:   '300 AZN-dən yuxarı sifarişlərə 50 AZN endirim',
  },
]
```

---

## 🏠 Ünvanlar (Addresses)

```typescript
// Leyla Quliyeva üçün
[
  {
    label:      'Ev',
    fullName:   'Leyla Quliyeva',
    phone:      '+994551234567',
    city:       'Bakı',
    district:   'Nəsimi rayonu',
    street:     'Füzuli küçəsi 12, mənzil 45',
    zipCode:    'AZ1014',
    isDefault:  true,
  },
  {
    label:      'İş',
    fullName:   'Leyla Quliyeva',
    phone:      '+994551234567',
    city:       'Bakı',
    district:   'Nərimanov rayonu',
    street:     'Hüseyn Cavid prospekti 40',
    zipCode:    'AZ1073',
    isDefault:  false,
  },
]
```

---

## ⭐ Rəylər (Reviews)

```typescript
[
  {
    product:  'iphone-15-pro-256gb',
    user:     'leyla@gmail.com',
    rating:   5,
    title:    'Əla telefon!',
    comment:  'Kamerasından çox razıyam, foto keyfiyyəti həqiqətən yaxşıdır. Çatdırılma da sürətli oldu.',
    isVerified: true,
  },
  {
    product:  'iphone-15-pro-256gb',
    user:     'murad@gmail.com',
    rating:   4,
    title:    'Yaxşıdır, amma bahadır',
    comment:  'Telefon çox yaxşıdır, amma qiymət bir az yüksəkdir. Keyfiyyətinə görə dəyər.',
    isVerified: true,
  },
  {
    product:  'samsung-galaxy-s24-ultra',
    user:     'leyla@gmail.com',
    rating:   5,
    title:    'S Pen çox işlədirəm',
    comment:  'Qeyd aparmaq üçün S Pen çox əlverişlidir. Kamera da fantastikdir.',
    isVerified: false,
  },
  {
    product:  'macbook-air-m3-13',
    user:     'murad@gmail.com',
    rating:   5,
    title:    'Ən yaxşı noutbuk',
    comment:  'Pil ömrü inanılmazdır, gerçəkdən 15-16 saat gəlir. M3 çip hər şeyi uçaraq açır.',
    isVerified: true,
  },
]
```

---

## 🌍 i18n Nümunə Açarları

Məhsul kateqoriyaları üçün `az.json`, `en.json`, `ru.json` açarları:

```json
// az.json
{
  "categories": {
    "elektronika":   "Elektronika",
    "geyim":         "Geyim",
    "ev-ve-bag":     "Ev və Bağ",
    "idman":         "İdman",
    "gozellik":      "Gözəllik",
    "usaq-dunyasi":  "Uşaq Dünyası",
    "smartfonlar":   "Smartfonlar",
    "noutbuklar":    "Noutbuklar",
    "plansetler":    "Planşetlər",
    "qulaqliqlar":   "Qulaqlıqlar",
    "smartsaatlar":  "Smartsaatlar",
    "kisi-geyimleri":"Kişi Geyimləri",
    "qadin-geyimleri":"Qadın Geyimləri",
    "ayaqqabilar":   "Ayaqqabılar"
  }
}

// en.json
{
  "categories": {
    "elektronika":   "Electronics",
    "geyim":         "Clothing",
    "ev-ve-bag":     "Home & Garden",
    "idman":         "Sports",
    "gozellik":      "Beauty",
    "usaq-dunyasi":  "Kids World",
    "smartfonlar":   "Smartphones",
    "noutbuklar":    "Laptops",
    "plansetler":    "Tablets",
    "qulaqliqlar":   "Headphones",
    "smartsaatlar":  "Smartwatches",
    "kisi-geyimleri":"Men's Clothing",
    "qadin-geyimleri":"Women's Clothing",
    "ayaqqabilar":   "Footwear"
  }
}

// ru.json
{
  "categories": {
    "elektronika":   "Электроника",
    "geyim":         "Одежда",
    "ev-ve-bag":     "Дом и Сад",
    "idman":         "Спорт",
    "gozellik":      "Красота",
    "usaq-dunyasi":  "Детский Мир",
    "smartfonlar":   "Смартфоны",
    "noutbuklar":    "Ноутбуки",
    "plansetler":    "Планшеты",
    "qulaqliqlar":   "Наушники",
    "smartsaatlar":  "Смарт-часы",
    "kisi-geyimleri":"Мужская одежда",
    "qadin-geyimleri":"Женская одежда",
    "ayaqqabilar":   "Обувь"
  }
}
```

---

## seed.ts Əsas Strukturu (Agent üçün şablon)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başladı...');

  // 1. Köhnə datanı təmizlə (sıra önəmlidir — foreign key)
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  // 2. İstifadəçilər
  const hashedPassword = await bcrypt.hash('Admin@2026!', 12);
  // ... SEED_DATA.md-dən istifadəçiləri yarat

  // 3. Kateqoriyalar (əvvəl ana, sonra alt)
  // ... SEED_DATA.md-dən kateqoriyaları yarat

  // 4. Məhsullar
  // ... SEED_DATA.md-dən məhsulları yarat

  // 5. Kuponlar
  // ... SEED_DATA.md-dən kuponları yarat

  // 6. Rəylər
  // ... SEED_DATA.md-dən rəyləri yarat

  console.log('✅ Seed tamamlandı!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

---

> **Qeyd:** Şəkil URL-ləri seed-də Cloudinary URL-ləri ilə əvəz edilməlidir.
> Lokal inkişafda placeholder şəkillər üçün `https://placehold.co/800x800` istifadə oluna bilər.
