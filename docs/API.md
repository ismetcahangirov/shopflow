# API.md — REST API Sənədləşməsi

> **Base URL (dev):**  `http://localhost:5000/api`  
> **Base URL (prod):** `https://api.shopflow.az/api`  
> **Format:** JSON  
> **Auth:** Bearer Token (JWT) — `Authorization: Bearer <access_token>`  
> **Son yenilənmə:** 2026

---

## Ümumi Qaydalar

### Auth Header
```
Authorization: Bearer <access_token>
```

### Standart Cavab Formatı

```json
// Uğurlu — tək resurs
{
  "success": true,
  "message": "Məhsul uğurla əldə edildi",
  "data": { }
}

// Uğurlu — siyahı (pagination ilə)
{
  "success": true,
  "message": "Məhsullar əldə edildi",
  "data": [ ],
  "pagination": {
    "page":  1,
    "limit": 20,
    "total": 145,
    "pages": 8
  }
}

// Xəta
{
  "success":    false,
  "message":    "Məhsul tapılmadı",
  "error":      "NOT_FOUND",
  "statusCode": 404
}

// Validasiya xətası
{
  "success":    false,
  "message":    "Daxil edilən məlumat yanlışdır",
  "error":      "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    { "field": "price",  "message": "Qiymət müsbət olmalıdır" },
    { "field": "stock",  "message": "Stok tam ədəd olmalıdır" }
  ]
}
```

### HTTP Status Kodları

| Kod | Məna |
|---|---|
| `200` | Uğurlu |
| `201` | Yaradıldı |
| `204` | Uğurlu — məzmun yoxdur (DELETE) |
| `400` | Yanlış sorğu (validation xətası) |
| `401` | Autentifikasiya tələb olunur |
| `403` | İcazə yoxdur |
| `404` | Tapılmadı |
| `409` | Konflikt (artıq mövcuddur) |
| `422` | Emal edilə bilməz (məs. stok yoxdur) |
| `429` | Çox sorğu (rate limit) |
| `500` | Server xətası |

### Ümumi Query Parametrləri

```
?page=1&limit=20&sort=createdAt_desc&search=iphone
```

| Parametr | Default | Nümunə | Məna |
|---|---|---|---|
| `page` | `1` | `?page=2` | Səhifə nömrəsi |
| `limit` | `20` | `?limit=50` | Hər səhifədə nəticə sayı (max: 100) |
| `sort` | `createdAt_desc` | `?sort=price_asc` | `sahə_asc\|desc` |
| `search` | — | `?search=iphone` | Ad/açıqlama üzrə axtarış |

---

## 1. AUTH ENDPOİNTLƏRİ

### `POST /api/auth/register`
**Açıqlama:** Yeni müştəri qeydiyyatı  
**Auth:** Tələb olunmur  
**Rate Limit:** 5 sorğu / 15 dəq  

**Request Body:**
```json
{
  "name":            "Əli Həsənov",
  "email":           "ali@example.com",
  "password":        "StrongPass123!",
  "confirmPassword": "StrongPass123!"
}
```

**Uğurlu Cavab `201`:**
```json
{
  "success": true,
  "message": "Qeydiyyat uğurla tamamlandı. Email təsdiq linki göndərildi.",
  "data": {
    "user": {
      "id":    "clx1234abc",
      "name":  "Əli Həsənov",
      "email": "ali@example.com",
      "role":  "CUSTOMER"
    },
    "accessToken":  "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### `POST /api/auth/login`
**Açıqlama:** Email və şifrə ilə giriş  
**Auth:** Tələb olunmur  
**Rate Limit:** 5 sorğu / 15 dəq  

**Request Body:**
```json
{
  "email":    "ali@example.com",
  "password": "StrongPass123!"
}
```

**Uğurlu Cavab `200`:**
```json
{
  "success": true,
  "message": "Giriş uğurlu oldu",
  "data": {
    "user": {
      "id":         "clx1234abc",
      "name":       "Əli Həsənov",
      "email":      "ali@example.com",
      "role":       "CUSTOMER",
      "avatar":     "https://res.cloudinary.com/shopflow/...",
      "isVerified": true
    },
    "accessToken":  "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### `POST /api/auth/google`
**Açıqlama:** Google OAuth ilə giriş / qeydiyyat  
**Auth:** Tələb olunmur  

**Request Body:**
```json
{
  "googleToken": "ya29.a0ARrd..."
}
```

**Uğurlu Cavab `200`:**
```json
{
  "success": true,
  "message": "Google ilə giriş uğurlu oldu",
  "data": {
    "user":         { "id": "...", "name": "...", "role": "CUSTOMER" },
    "accessToken":  "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "isNewUser":    false
  }
}
```

---

### `POST /api/auth/logout`
**Açıqlama:** Çıxış — refresh token-i etibarsız et  
**Auth:** Tələb olunur  

**Request Body:**
```json
{ "refreshToken": "eyJhbGci..." }
```

**Uğurlu Cavab `200`:**
```json
{ "success": true, "message": "Çıxış uğurlu oldu" }
```

---

### `POST /api/auth/refresh-token`
**Açıqlama:** Access token-i yenilə  
**Auth:** Tələb olunmur  

**Request Body:**
```json
{ "refreshToken": "eyJhbGci..." }
```

**Uğurlu Cavab `200`:**
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGci..." }
}
```

---

### `POST /api/auth/forgot-password`
**Açıqlama:** Şifrə sıfırlama emaili göndər  
**Auth:** Tələb olunmur  
**Rate Limit:** 3 sorğu / 1 saat  

**Request Body:**
```json
{ "email": "ali@example.com" }
```

**Cavab `200`:**
```json
{
  "success": true,
  "message": "Şifrə sıfırlama linki emailinizə göndərildi (30 dəq etibarlıdır)"
}
```

---

### `POST /api/auth/reset-password/:token`
**Açıqlama:** Şifrəni sıfırla  
**Auth:** Tələb olunmur  

**Request Body:**
```json
{
  "password":        "NewStrongPass123!",
  "confirmPassword": "NewStrongPass123!"
}
```

**Cavab `200`:**
```json
{ "success": true, "message": "Şifrə uğurla yeniləndi" }
```

---

### `GET /api/auth/verify-email/:token`
**Açıqlama:** Email ünvanını təsdiqlə  
**Auth:** Tələb olunmur  

**Cavab `200`:**
```json
{ "success": true, "message": "Email uğurla təsdiqləndi" }
```

---

## 2. İSTİFADƏÇİ ENDPOİNTLƏRİ

### `GET /api/users/me`
**Auth:** Tələb olunur — `[ADMIN, VENDOR, CUSTOMER]`  

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "id":         "clx1234abc",
    "name":       "Əli Həsənov",
    "email":      "ali@example.com",
    "role":       "CUSTOMER",
    "avatar":     "https://...",
    "isVerified": true,
    "isActive":   true,
    "createdAt":  "2026-01-15T10:00:00Z"
  }
}
```

---

### `PUT /api/users/me`
**Auth:** Tələb olunur — `[ADMIN, VENDOR, CUSTOMER]`  

**Request Body:**
```json
{
  "name":  "Əli Həsən",
  "phone": "+994501234567"
}
```

---

### `PUT /api/users/me/password`
**Auth:** Tələb olunur — `[ADMIN, VENDOR, CUSTOMER]`  

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword":     "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

---

### `POST /api/users/me/avatar`
**Auth:** Tələb olunur  
**Content-Type:** `multipart/form-data`  

**Form Data:**
```
avatar: <image> (max 2MB — jpg/png/webp)
```

**Cavab `200`:**
```json
{
  "success": true,
  "data": { "avatar": "https://res.cloudinary.com/shopflow/avatars/user-clx.webp" }
}
```

---

### `GET /api/users` *(Admin)*
**Auth:** Tələb olunur — `[ADMIN]`  

**Query:**
```
?page=1&limit=20&role=CUSTOMER&search=ali&isActive=true
```

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":        "clx...",
      "name":      "Əli Həsənov",
      "email":     "ali@example.com",
      "role":      "CUSTOMER",
      "isActive":  true,
      "orderCount": 5,
      "totalSpent": 1240.50,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 340, "pages": 17 }
}
```

---

### `PATCH /api/users/:id/status` *(Admin)*
**Auth:** `[ADMIN]`  

**Request Body:**
```json
{ "isActive": false }
```

---

## 3. MƏHSUL ENDPOİNTLƏRİ

### `GET /api/products`
**Auth:** Tələb olunmur (public)  

**Query Parametrləri:**
```
?page=1&limit=20&category=telefonlar&brand=Apple&minPrice=100&maxPrice=3000
&sort=price_asc&search=iphone&isFeatured=true&inStock=true
```

| Parametr | Nümunə | Məna |
|---|---|---|
| `category` | `?category=telefonlar` | Kateqoriya slug |
| `brand` | `?brand=Apple,Samsung` | Vergüllə ayrılmış brendlər |
| `minPrice` | `?minPrice=100` | Minimum qiymət |
| `maxPrice` | `?maxPrice=3000` | Maksimum qiymət |
| `isFeatured` | `?isFeatured=true` | Yalnız öne çıxanlar |
| `inStock` | `?inStock=true` | Yalnız stokda olanlar |
| `sort` | `?sort=price_asc` | `price_asc`, `price_desc`, `rating_desc`, `sales_desc`, `createdAt_desc` |

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":           "clx...",
      "name":         "iPhone 15 Pro 256GB",
      "slug":         "iphone-15-pro-256gb",
      "shortDesc":    "Apple A17 Pro çip, 48MP kamera",
      "price":        2499.99,
      "comparePrice": 2799.99,
      "brand":        "Apple",
      "stock":        50,
      "avgRating":    4.8,
      "reviewCount":  124,
      "isFeatured":   true,
      "image": {
        "url": "https://res.cloudinary.com/shopflow/...",
        "alt": "iPhone 15 Pro"
      },
      "category": { "name": "Telefonlar", "slug": "telefonlar" }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 89, "pages": 5 }
}
```

---

### `GET /api/products/:slug`
**Auth:** Tələb olunmur (public)  

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "id":           "clx...",
    "name":         "iPhone 15 Pro 256GB",
    "slug":         "iphone-15-pro-256gb",
    "description":  "Apple iPhone 15 Pro...",
    "shortDesc":    "Apple A17 Pro çip...",
    "price":        2499.99,
    "comparePrice": 2799.99,
    "sku":          "IPH15PRO-256-TI",
    "stock":        50,
    "brand":        "Apple",
    "tags":         ["telefon", "apple", "5g"],
    "avgRating":    4.8,
    "reviewCount":  124,
    "salesCount":   356,
    "isFeatured":   true,
    "images": [
      { "url": "https://...", "alt": "iPhone 15 Pro öndan", "isMain": true },
      { "url": "https://...", "alt": "iPhone 15 Pro arxadan" }
    ],
    "attributes": [
      { "name": "Rəng",     "value": "Natural Titanium" },
      { "name": "Yaddaş",   "value": "256GB" },
      { "name": "Ekran",    "value": "6.1 düym Super Retina XDR" }
    ],
    "variants": [
      { "id": "...", "name": "128GB", "price": 2199.99, "stock": 20 },
      { "id": "...", "name": "256GB", "price": 2499.99, "stock": 50 },
      { "id": "...", "name": "512GB", "price": 2999.99, "stock": 10 }
    ],
    "category": { "id": "...", "name": "Telefonlar", "slug": "telefonlar" },
    "vendor":   { "id": "...", "storeName": "Tech Mağazası", "slug": "tech-magazasi" },
    "reviews": [
      {
        "id":         "...",
        "rating":     5,
        "title":      "Mükəmməl telefon",
        "body":       "Kamera keyfiyyəti çox yaxşıdır...",
        "isVerified": true,
        "createdAt":  "2026-01-20T10:00:00Z",
        "user": { "name": "Kamran R.", "avatar": "https://..." }
      }
    ],
    "relatedProducts": [ ]
  }
}
```

---

### `POST /api/products` *(Admin/Vendor)*
**Auth:** `[ADMIN, VENDOR]`  
**Content-Type:** `multipart/form-data`  

**Form Data:**
```
name:         "Yeni Məhsul"
description:  "Məhsul haqqında..."
price:        299.99
comparePrice: 399.99   (opsional)
sku:          "SKU-001"
stock:        100
categoryId:   "clx..."
brand:        "Nike"   (opsional)
tags:         ["idman","geyim"]
isFeatured:   false
images:       <files>  (max 5 şəkil, hər biri max 5MB)
attributes:   [{"name":"Rəng","value":"Qırmızı"}]
```

**Cavab `201`:**
```json
{
  "success": true,
  "message": "Məhsul uğurla yaradıldı",
  "data": { "id": "clx...", "slug": "yeni-mehsul", ... }
}
```

---

### `PUT /api/products/:id` *(Admin/Vendor)*
**Auth:** `[ADMIN, VENDOR]` — Vendor yalnız öz məhsulunu dəyişə bilər  

**Request Body:** (dəyişdirilən sahələr)
```json
{
  "price": 249.99,
  "stock": 75,
  "isFeatured": true
}
```

---

### `DELETE /api/products/:id` *(Admin/Vendor)*
**Auth:** `[ADMIN, VENDOR]`  

**Cavab `200`:**
```json
{ "success": true, "message": "Məhsul uğurla silindi" }
```

---

### `GET /api/products/featured`
**Auth:** Tələb olunmur  
**Açıqlama:** Ana səhifə üçün öne çıxan məhsullar (ISR cache-dən)  

**Query:** `?limit=8`

---

### `GET /api/products/search`
**Auth:** Tələb olunmur  

**Query:** `?q=iphone&limit=5` (autocomplete üçün)

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "iPhone 15 Pro", "slug": "iphone-15-pro", "price": 2499.99,
      "image": "https://..." }
  ]
}
```

---

## 4. KATEQORİYA ENDPOİNTLƏRİ

### `GET /api/categories`
**Auth:** Tələb olunmur  
**Açıqlama:** Bütün aktiv kateqoriyalar (ağac strukturu ilə)  

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":       "clx...",
      "name":     "Elektronika",
      "slug":     "elektronika",
      "image":    "https://...",
      "productCount": 145,
      "children": [
        { "id": "...", "name": "Telefonlar",   "slug": "telefonlar",   "productCount": 89 },
        { "id": "...", "name": "Noutbuklar",   "slug": "noutbuklar",   "productCount": 34 },
        { "id": "...", "name": "Planşetlər",   "slug": "plansetler",   "productCount": 22 }
      ]
    },
    {
      "id":       "clx...",
      "name":     "Geyim",
      "slug":     "geyim",
      "children": [ ]
    }
  ]
}
```

---

### `GET /api/categories/:slug`
**Auth:** Tələb olunmur  

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "id":       "clx...",
    "name":     "Telefonlar",
    "slug":     "telefonlar",
    "description": "...",
    "image":    "https://...",
    "parent":   { "id": "...", "name": "Elektronika", "slug": "elektronika" },
    "children": [ ],
    "metaTitle": "Telefonlar — Ən Yaxşı Qiymətlər | ShopFlow",
    "metaDesc":  "Azərbaycanda ən geniş telefon seçimi..."
  }
}
```

---

### `POST /api/categories` *(Admin)*
**Auth:** `[ADMIN]`  

**Request Body:**
```json
{
  "name":      "Smartfonlar",
  "slug":      "smartfonlar",
  "parentId":  "clx...",
  "sortOrder": 1
}
```

---

### `PUT /api/categories/:id` *(Admin)*
**Auth:** `[ADMIN]`  

---

### `DELETE /api/categories/:id` *(Admin)*
**Auth:** `[ADMIN]`  

> ⚠️ Məhsul olan kateqoriya silinə bilməz — `422 CATEGORY_HAS_PRODUCTS`

---

## 5. SİFARİŞ ENDPOİNTLƏRİ

### `GET /api/orders` *(Admin)*
**Auth:** `[ADMIN]`  

**Query:**
```
?page=1&limit=20&status=PENDING&paymentStatus=PAID&search=ORD-2026
&startDate=2026-01-01&endDate=2026-01-31
```

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":           "clx...",
      "orderNumber":  "ORD-20260001",
      "status":       "PENDING",
      "paymentStatus":"PAID",
      "total":        2549.99,
      "itemCount":    2,
      "createdAt":    "2026-01-28T14:00:00Z",
      "user": { "id": "...", "name": "Əli Həsənov", "email": "ali@example.com" }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 892, "pages": 45 }
}
```

---

### `GET /api/orders/my`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Öz sifarişlərini gör  

**Query:** `?page=1&limit=10&status=DELIVERED`

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "clx...",
      "orderNumber": "ORD-20260001",
      "status":      "DELIVERED",
      "total":       2549.99,
      "createdAt":   "2026-01-28T14:00:00Z",
      "items": [
        {
          "productName": "iPhone 15 Pro 256GB",
          "quantity":    1,
          "price":       2499.99,
          "image":       "https://..."
        }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 12, "pages": 2 }
}
```

---

### `GET /api/orders/:id`
**Auth:** `[ADMIN]` və ya sifariş sahibi `[CUSTOMER]`  

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "id":             "clx...",
    "orderNumber":    "ORD-20260001",
    "status":         "SHIPPED",
    "paymentStatus":  "PAID",
    "paymentMethod":  "stripe",
    "trackingNumber": "AZ123456789",
    "subtotal":       2499.99,
    "shippingCost":   5.00,
    "discount":       0,
    "total":          2504.99,
    "notes":          "Zəngli çalın",
    "shippedAt":      "2026-01-29T10:00:00Z",
    "createdAt":      "2026-01-28T14:00:00Z",
    "user": {
      "id":    "...",
      "name":  "Əli Həsənov",
      "email": "ali@example.com"
    },
    "address": {
      "fullName": "Əli Həsənov",
      "phone":    "+994501234567",
      "city":     "Bakı",
      "district": "Nəsimi",
      "street":   "Nizami küçəsi 10"
    },
    "items": [
      {
        "id":          "...",
        "productName": "iPhone 15 Pro 256GB",
        "productSku":  "IPH15PRO-256-TI",
        "quantity":    1,
        "price":       2499.99,
        "total":       2499.99,
        "product": {
          "id":   "...",
          "slug": "iphone-15-pro-256gb",
          "image": "https://..."
        }
      }
    ],
    "coupon": { "code": "WELCOME10", "value": 10, "type": "PERCENTAGE" },
    "statusHistory": [
      { "status": "PENDING",   "createdAt": "2026-01-28T14:00:00Z" },
      { "status": "CONFIRMED", "createdAt": "2026-01-28T14:05:00Z" },
      { "status": "SHIPPED",   "createdAt": "2026-01-29T10:00:00Z" }
    ]
  }
}
```

---

### `POST /api/orders`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Sifariş yarat (ödənişdən əvvəl)  

**Request Body:**
```json
{
  "addressId":   "clx...",
  "couponCode":  "WELCOME10",
  "notes":       "Zəngli çalın"
}
```

**Cavab `201`:**
```json
{
  "success": true,
  "message": "Sifariş yaradıldı",
  "data": {
    "id":          "clx...",
    "orderNumber": "ORD-20260042",
    "total":       2254.99,
    "discount":    250.00
  }
}
```

---

### `PATCH /api/orders/:id/status` *(Admin)*
**Auth:** `[ADMIN]`  

**Request Body:**
```json
{
  "status":         "SHIPPED",
  "trackingNumber": "AZ123456789",
  "note":           "Kargo şirkətinə verildi"
}
```

---

### `POST /api/orders/:id/cancel`
**Auth:** `[ADMIN]` və ya sifariş sahibi `[CUSTOMER]` (yalnız PENDING statusda)  

**Request Body:**
```json
{ "reason": "Fikrimi dəyişdim" }
```

---

## 6. SƏBƏT ENDPOİNTLƏRİ

### `GET /api/cart`
**Auth:** `[CUSTOMER]`  

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "id":        "clx...",
    "itemCount": 2,
    "subtotal":  2749.98,
    "items": [
      {
        "id":       "...",
        "quantity": 1,
        "product": {
          "id":    "...",
          "name":  "iPhone 15 Pro 256GB",
          "slug":  "iphone-15-pro-256gb",
          "price": 2499.99,
          "stock": 50,
          "image": "https://..."
        }
      },
      {
        "id":       "...",
        "quantity": 1,
        "product": {
          "id":    "...",
          "name":  "Nike Air Max 270",
          "price": 249.99,
          "stock": 100,
          "image": "https://..."
        }
      }
    ]
  }
}
```

---

### `POST /api/cart/items`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Səbətə məhsul əlavə et  

**Request Body:**
```json
{
  "productId": "clx...",
  "quantity":  1
}
```

---

### `PATCH /api/cart/items/:productId`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Miqdarı dəyiş  

**Request Body:**
```json
{ "quantity": 2 }
```

---

### `DELETE /api/cart/items/:productId`
**Auth:** `[CUSTOMER]`  

---

### `DELETE /api/cart`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Səbəti tamamilə təmizlə  

---

## 7. ÖDƏNİŞ ENDPOİNTLƏRİ

### `POST /api/payments/create-intent`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Stripe PaymentIntent yarat  

**Request Body:**
```json
{ "orderId": "clx..." }
```

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_3NX...secret_...",
    "amount":       250499,
    "currency":     "azn"
  }
}
```

---

### `POST /api/payments/confirm`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Ödəniş uğurunu təsdiqlə  

**Request Body:**
```json
{
  "orderId":         "clx...",
  "paymentIntentId": "pi_3NX..."
}
```

**Cavab `200`:**
```json
{
  "success": true,
  "message": "Ödəniş uğurla tamamlandı",
  "data": {
    "orderId":     "clx...",
    "orderNumber": "ORD-20260042",
    "status":      "CONFIRMED"
  }
}
```

---

### `POST /api/payments/webhook` *(Stripe)*
**Auth:** Stripe Signature (`stripe-signature` header)  
**Açıqlama:** Stripe webhook handler — bu endpoint JWT qoruması olmadan çalışır  

> ⚠️ Bu endpoint yalnız Stripe serverindən gəlir. `stripe-signature` header yoxlanır.

**Emal edilən event-lər:**
```
payment_intent.succeeded     → Order status: CONFIRMED, PaymentStatus: PAID
payment_intent.failed        → Order status: CANCELLED
charge.refunded              → PaymentStatus: REFUNDED
```

---

## 8. RƏY ENDPOİNTLƏRİ

### `GET /api/reviews`
**Auth:** Tələb olunmur  

**Query:** `?productId=clx...&page=1&limit=10&rating=5`

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":         "clx...",
      "rating":     5,
      "title":      "Mükəmməl məhsul",
      "body":       "Çox məmnun qaldım, sürətli çatdırılma...",
      "isVerified": true,
      "helpfulCount": 12,
      "createdAt":  "2026-01-20T10:00:00Z",
      "user": { "name": "Kamran R.", "avatar": "https://..." }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 124, "pages": 13 },
  "summary": {
    "avgRating":  4.8,
    "totalCount": 124,
    "distribution": { "5": 89, "4": 22, "3": 8, "2": 3, "1": 2 }
  }
}
```

---

### `POST /api/reviews`
**Auth:** `[CUSTOMER]`  
**Qaydalar:** Müştəri həmin məhsulu almalıdır; bir məhsula bir rəy  

**Request Body:**
```json
{
  "productId": "clx...",
  "rating":    5,
  "title":     "Mükəmməl məhsul",
  "body":      "Kamera keyfiyyəti çox yaxşıdır..."
}
```

**Cavab `201`:**
```json
{
  "success": true,
  "message": "Rəyiniz moderasiya üçün göndərildi",
  "data": { "id": "clx...", "isApproved": false }
}
```

---

### `PATCH /api/reviews/:id/approve` *(Admin)*
**Auth:** `[ADMIN]`  

**Request Body:**
```json
{ "isApproved": true }
```

---

### `DELETE /api/reviews/:id` *(Admin)*
**Auth:** `[ADMIN]`  

---

## 9. KUPON ENDPOİNTLƏRİ

### `POST /api/coupons/validate`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Kupon kodunu yoxla  

**Request Body:**
```json
{
  "code":       "WELCOME10",
  "orderTotal": 500
}
```

**Uğurlu Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "code":        "WELCOME10",
    "type":        "PERCENTAGE",
    "value":       10,
    "discount":    50.00,
    "finalTotal":  450.00,
    "message":     "10% endirim tətbiq edildi"
  }
}
```

**Uğursuz Cavab `422`:**
```json
{
  "success": false,
  "message": "Kupon etibarsızdır və ya müddəti bitib",
  "error":   "COUPON_INVALID"
}
```

---

### `GET /api/coupons` *(Admin)*
**Auth:** `[ADMIN]`  

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":         "clx...",
      "code":       "WELCOME10",
      "type":       "PERCENTAGE",
      "value":      10,
      "usedCount":  45,
      "maxUses":    1000,
      "isActive":   true,
      "expiresAt":  null
    }
  ]
}
```

---

### `POST /api/coupons` *(Admin)*
**Auth:** `[ADMIN]`  

**Request Body:**
```json
{
  "code":          "SUMMER25",
  "type":          "PERCENTAGE",
  "value":         25,
  "minOrderValue": 200,
  "maxDiscount":   100,
  "maxUses":       500,
  "expiresAt":     "2026-09-01T00:00:00Z"
}
```

---

### `PUT /api/coupons/:id` *(Admin)*
### `DELETE /api/coupons/:id` *(Admin)*
**Auth:** `[ADMIN]`  

---

## 10. İSTƏK SİYAHISI ENDPOİNTLƏRİ

### `GET /api/wishlist`
**Auth:** `[CUSTOMER]`  

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":        "clx...",
      "addedAt":   "2026-01-20T10:00:00Z",
      "product": {
        "id":    "...",
        "name":  "iPhone 15 Pro",
        "slug":  "iphone-15-pro-256gb",
        "price": 2499.99,
        "stock": 50,
        "image": "https://..."
      }
    }
  ]
}
```

---

### `POST /api/wishlist`
**Auth:** `[CUSTOMER]`  

**Request Body:**
```json
{ "productId": "clx..." }
```

---

### `DELETE /api/wishlist/:productId`
**Auth:** `[CUSTOMER]`  

---

## 11. ÜNVAN ENDPOİNTLƏRİ

### `GET /api/addresses`
**Auth:** `[CUSTOMER]`  

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":        "clx...",
      "fullName":  "Əli Həsənov",
      "phone":     "+994501234567",
      "city":      "Bakı",
      "district":  "Nəsimi",
      "street":    "Nizami küçəsi 10",
      "building":  "5A",
      "apartment": "12",
      "isDefault": true
    }
  ]
}
```

---

### `POST /api/addresses`
**Auth:** `[CUSTOMER]`  

**Request Body:**
```json
{
  "fullName":  "Əli Həsənov",
  "phone":     "+994501234567",
  "city":      "Bakı",
  "district":  "Nəsimi",
  "street":    "Nizami küçəsi 10",
  "building":  "5A",
  "apartment": "12",
  "isDefault": true
}
```

---

### `PUT /api/addresses/:id`
**Auth:** `[CUSTOMER]`  

---

### `DELETE /api/addresses/:id`
**Auth:** `[CUSTOMER]`  

---

### `PATCH /api/addresses/:id/default`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Ünvanı default et  

---

## 12. VENDOR ENDPOİNTLƏRİ

### `POST /api/vendors/apply`
**Auth:** `[CUSTOMER]`  
**Açıqlama:** Vendor olmaq üçün müraciət et  

**Request Body:**
```json
{
  "storeName":   "Mənim Mağazam",
  "description": "Qısa açıqlama",
  "phone":       "+994501234567"
}
```

---

### `GET /api/vendors` *(Admin)*
**Auth:** `[ADMIN]`  

**Query:** `?status=PENDING&page=1&limit=20`

**Cavab `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "clx...",
      "storeName":   "Tech Mağazası",
      "slug":        "tech-magazasi",
      "status":      "PENDING",
      "productCount": 0,
      "totalSales":  0,
      "createdAt":   "2026-01-28T14:00:00Z",
      "user": { "name": "Vüsal Əliyev", "email": "vusal@example.com" }
    }
  ]
}
```

---

### `PATCH /api/vendors/:id/status` *(Admin)*
**Auth:** `[ADMIN]`  

**Request Body:**
```json
{
  "status": "APPROVED",
  "note":   "Hesabınız təsdiqləndi"
}
```

---

### `GET /api/vendors/me` *(Vendor)*
**Auth:** `[VENDOR]`  

---

### `PUT /api/vendors/me` *(Vendor)*
**Auth:** `[VENDOR]`  

**Request Body:**
```json
{
  "storeName":   "Yenilənmiş Mağaza Adı",
  "description": "Yeni açıqlama"
}
```

---

### `GET /api/vendors/me/stats` *(Vendor)*
**Auth:** `[VENDOR]`  

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "totalProducts":  24,
    "totalOrders":    156,
    "totalRevenue":   45280.50,
    "pendingOrders":  8,
    "thisMonthSales": 8920.00,
    "avgRating":      4.6
  }
}
```

---

## 13. ANALİTİKA ENDPOİNTLƏRİ *(Admin)*

### `GET /api/analytics/dashboard`
**Auth:** `[ADMIN]`  

**Query:** `?period=30` (gün)

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue":     125480.50,
      "totalOrders":      892,
      "totalCustomers":   340,
      "totalProducts":    245,
      "avgOrderValue":    140.67,
      "conversionRate":   3.2
    },
    "revenueChart": [
      { "date": "2026-01-01", "revenue": 4280.50, "orders": 32 },
      { "date": "2026-01-02", "revenue": 3920.00, "orders": 28 }
    ],
    "topProducts": [
      {
        "id":         "clx...",
        "name":       "iPhone 15 Pro",
        "salesCount": 45,
        "revenue":    112499.55,
        "image":      "https://..."
      }
    ],
    "ordersByStatus": {
      "PENDING":    12,
      "CONFIRMED":  8,
      "PROCESSING": 5,
      "SHIPPED":    23,
      "DELIVERED":  789,
      "CANCELLED":  45,
      "REFUNDED":   10
    },
    "recentOrders": [
      {
        "id":          "clx...",
        "orderNumber": "ORD-20260892",
        "total":       2549.99,
        "status":      "PENDING",
        "createdAt":   "2026-01-28T14:00:00Z",
        "user": { "name": "Kamran R." }
      }
    ]
  }
}
```

---

### `GET /api/analytics/sales`
**Auth:** `[ADMIN]`  

**Query:** `?startDate=2026-01-01&endDate=2026-01-31&groupBy=day`

---

## 14. SAYT PARAMETRLƏRİ ENDPOİNTLƏRİ

### `GET /api/settings`
**Auth:** Tələb olunmur (public parametrlər)  

**Cavab `200`:**
```json
{
  "success": true,
  "data": {
    "site_name":       "ShopFlow",
    "currency":        "AZN",
    "currency_symbol": "₼",
    "shipping_cost":   "5.00",
    "free_shipping_min": "100"
  }
}
```

---

### `PUT /api/settings` *(Admin)*
**Auth:** `[ADMIN]`  

**Request Body:**
```json
{
  "settings": [
    { "key": "shipping_cost",    "value": "7.50" },
    { "key": "free_shipping_min","value": "150" }
  ]
}
```

---

## 15. HEALTH CHECK

### `GET /api/health`
**Auth:** Tələb olunmur  

**Cavab `200`:**
```json
{
  "status":    "ok",
  "timestamp": "2026-01-28T14:00:00Z",
  "uptime":    3600,
  "db":        "connected",
  "env":       "production"
}
```

---

## Xəta Kodları

| Kod | HTTP | Açıqlama |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Daxil edilən məlumat yanlışdır |
| `INVALID_CREDENTIALS` | 401 | Email və ya şifrə yanlışdır |
| `UNAUTHORIZED` | 401 | Token yoxdur və ya etibarsızdır |
| `TOKEN_EXPIRED` | 401 | Access token müddəti bitib |
| `ACCOUNT_DISABLED` | 403 | Hesab deaktiv edilib |
| `EMAIL_NOT_VERIFIED` | 403 | Email təsdiqlənməyib |
| `FORBIDDEN` | 403 | Bu əməliyyat üçün icazəniz yoxdur |
| `NOT_FOUND` | 404 | Resurs tapılmadı |
| `ALREADY_EXISTS` | 409 | Bu məlumat artıq mövcuddur |
| `OUT_OF_STOCK` | 422 | Stokda yoxdur |
| `COUPON_INVALID` | 422 | Kupon etibarsızdır |
| `COUPON_EXPIRED` | 422 | Kupanın müddəti bitib |
| `COUPON_MIN_ORDER` | 422 | Minimum sifariş məbləği tələbi |
| `CATEGORY_HAS_PRODUCTS` | 422 | Məhsul olan kateqoriya silinə bilməz |
| `ALREADY_REVIEWED` | 422 | Bu məhsula artıq rəy yazıbsınız |
| `RATE_LIMIT_EXCEEDED` | 429 | Çox sorğu göndərildi |
| `INTERNAL_ERROR` | 500 | Server xətası |

---

## Rate Limiting

| Endpoint | Limit | Müddət |
|---|---|---|
| `POST /api/auth/login` | 5 | 15 dəq |
| `POST /api/auth/register` | 5 | 15 dəq |
| `POST /api/auth/forgot-password` | 3 | 1 saat |
| `POST /api/auth/google` | 10 | 15 dəq |
| `POST /api/reviews` | 10 | 1 saat |
| `POST /api/payments/*` | 20 | 1 dəq |
| `POST /api/users/me/avatar` | 10 | 1 saat |
| Ümumi API | 100 | 1 dəq |
