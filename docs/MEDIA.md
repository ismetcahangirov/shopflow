# MEDIA.md — Media & Şəkil İdarəsi

> **Layihə:** ShopFlow E-Commerce Platform  
> **GitHub:** [your-username/shopflow](https://github.com/your-username/shopflow)  
> **Son yenilənmə:** 2026

---

## 1. Ümumi Baxış

| Parametr | Dəyər |
|---|---|
| Media saxlama | Cloudinary (pulsuz 25GB, 25k transform/ay) |
| Yükləmə üsulu | Backend → Cloudinary (memory storage) |
| Frontend render | `next/image` (WebP/AVIF avtomatik) |
| CDN | Cloudinary CDN (qlobal edge) |
| İcazəli formatlar | JPG, PNG, WEBP |
| Məhsul şəkli max | 5MB, max 5 şəkil |
| Avatar max | 2MB |

---

## 2. Cloudinary Konfiqurasiyası

```typescript
// src/config/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY    ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error('Cloudinary mühit dəyişənləri tələb olunur');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,   // HTTPS URL-lər
});

export { cloudinary };
```

---

## 3. Qovluq Strukturu (Cloudinary)

```
shopflow/
├── products/
│   ├── clx1234abc-1234567890.webp   ← Məhsul şəkilləri
│   ├── clx1234abc-1234567891.webp
│   └── ...
├── avatars/
│   ├── user-clx1234abc.webp         ← İstifadəçi avatarları
│   └── ...
├── categories/
│   ├── elektronika.webp             ← Kateqoriya şəkilləri
│   └── ...
└── vendors/
    ├── tech-magazasi-logo.webp      ← Vendor logoları
    └── tech-magazasi-banner.webp
```

---

## 4. Upload Utility (TypeScript)

```typescript
// src/utils/cloudinaryUpload.ts

import { cloudinary }    from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { logger }        from '../config/logger';

interface UploadResult {
  url:       string;
  publicId:  string;
  width:     number;
  height:    number;
  format:    string;
  bytes:     number;
}

// ── Şəkil yüklə ──────────────────────────────────────────
export const uploadImage = async (
  buffer:  Buffer,
  folder:  string,
  options?: {
    publicId?:  string;
    maxWidth?:  number;
    maxHeight?: number;
    quality?:   number | 'auto';
  }
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id:     options?.publicId,
        resource_type: 'image',
        overwrite:     true,
        // Avtomatik format (WebP/AVIF)
        fetch_format: 'auto',
        // Keyfiyyət optimallaşması
        quality: options?.quality ?? 'auto',
        // Ölçü məhdudiyyəti
        transformation: [
          {
            width:  options?.maxWidth  ?? 1200,
            height: options?.maxHeight,
            crop:   'limit',                    // Orijinal nisbəti saxla
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary yükləmə xətası:', error);
          reject(new Error(error?.message ?? 'Yükləmə uğursuz oldu'));
          return;
        }
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
          width:    result.width,
          height:   result.height,
          format:   result.format,
          bytes:    result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

// ── Şəkli sil ────────────────────────────────────────────
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary şəkli silindi: ${publicId}`);
  } catch (err) {
    logger.error(`Cloudinary silmə xətası [${publicId}]:`, err);
    // Silmə xətası critical deyil — logla və davam et
  }
};

// ── Çoxlu şəkil yüklə (məhsul şəkilləri) ───────────────
export const uploadMultipleImages = async (
  files:   Express.Multer.File[],
  folder:  string,
  prefix?: string
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file, index) =>
    uploadImage(file.buffer, folder, {
      publicId: prefix
        ? `${prefix}-${Date.now()}-${index}`
        : undefined,
      maxWidth: 1200,
      quality:  'auto',
    })
  );

  return Promise.all(uploadPromises);
};

// ── URL transformasiyası (on-the-fly) ─────────────────────
export const getTransformedUrl = (
  publicId: string,
  options: {
    width?:   number;
    height?:  number;
    crop?:    'fill' | 'fit' | 'thumb' | 'scale' | 'limit';
    quality?: number | 'auto';
    format?:  'webp' | 'avif' | 'jpg' | 'png' | 'auto';
  } = {}
): string => {
  const transformations = [
    options.width   && `w_${options.width}`,
    options.height  && `h_${options.height}`,
    options.crop    && `c_${options.crop ?? 'limit'}`,
    options.quality && `q_${options.quality ?? 'auto'}`,
    options.format  && `f_${options.format ?? 'auto'}`,
  ]
    .filter(Boolean)
    .join(',');

  return cloudinary.url(publicId, {
    transformation: transformations ? [{ raw_transformation: transformations }] : [],
    secure: true,
  });
};
```

---

## 5. Multer Middleware (TypeScript)

```typescript
// src/middleware/uploadMiddleware.ts

import multer, { FileFilterCallback } from 'multer';
import { Request }                    from 'express';

const ALLOWED_MIME_TYPES   = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_PRODUCT_SIZE      = 5 * 1024 * 1024;   // 5MB
const MAX_AVATAR_SIZE       = 2 * 1024 * 1024;   // 2MB
const MAX_CATEGORY_SIZE     = 3 * 1024 * 1024;   // 3MB

// ── Memory storage — disk yazmırıq, Cloudinary-ə stream ──
const storage = multer.memoryStorage();

// ── Fayl filter ───────────────────────────────────────────
const createFileFilter = (
  allowedTypes: readonly string[] = ALLOWED_MIME_TYPES
) => (
  req:  Request,
  file: Express.Multer.File,
  cb:   FileFilterCallback
): void => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Yalnız ${allowedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ')} formatları icazəlidir`
      )
    );
  }
};

// ── Məhsul şəkilləri — max 5 fayl ────────────────────────
export const productImageUpload = multer({
  storage,
  fileFilter: createFileFilter(),
  limits: {
    fileSize: MAX_PRODUCT_SIZE,
    files:    5,
  },
});

// ── Avatar — max 1 fayl ───────────────────────────────────
export const avatarUpload = multer({
  storage,
  fileFilter: createFileFilter(),
  limits: {
    fileSize: MAX_AVATAR_SIZE,
    files:    1,
  },
});

// ── Kateqoriya şəkli — max 1 fayl ────────────────────────
export const categoryImageUpload = multer({
  storage,
  fileFilter: createFileFilter(),
  limits: {
    fileSize: MAX_CATEGORY_SIZE,
    files:    1,
  },
});

// ── Vendor logo/banner — max 2 fayl ──────────────────────
export const vendorImageUpload = multer({
  storage,
  fileFilter: createFileFilter(),
  limits: {
    fileSize: MAX_PRODUCT_SIZE,
    files:    2,
  },
});
```

---

## 6. Controller-lərdə İstifadə

### 6.1 Məhsul Şəkilləri

```typescript
// src/controllers/productController.ts

import { uploadMultipleImages, deleteImage } from '../utils/cloudinaryUpload';

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;

    // Məhsulu yarat
    const product = await prisma.product.create({
      data: {
        name:        req.body.name,
        slug:        slugify(req.body.name),
        description: req.body.description,
        price:       parseFloat(req.body.price),
        sku:         req.body.sku,
        stock:       parseInt(req.body.stock),
        categoryId:  req.body.categoryId,
        vendorId:    req.body.vendorId,
      },
    });

    // Şəkilləri Cloudinary-ə yüklə
    if (files?.length) {
      const uploadResults = await uploadMultipleImages(
        files,
        'shopflow/products',
        `product-${product.id}`
      );

      // Şəkilləri DB-yə saxla
      await prisma.productImage.createMany({
        data: uploadResults.map((result, index) => ({
          productId: product.id,
          url:       result.url,
          alt:       `${req.body.name} - ${index + 1}`,
          isMain:    index === 0,    // İlk şəkil əsas şəkildir
          sortOrder: index,
        })),
      });
    }

    const productWithImages = await prisma.product.findUnique({
      where:   { id: product.id },
      include: { images: true },
    });

    successResponse(res, {
      statusCode: 201,
      message:    'Məhsul uğurla yaradıldı',
      data:       productWithImages,
    });
  }
);

// Şəkil sil
export const deleteProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    const { imageId } = req.params;

    const image = await prisma.productImage.findUnique({
      where:   { id: imageId },
      include: { product: { select: { vendorId: true } } },
    });

    if (!image) {
      throw new AppError('Şəkil tapılmadı', 404, 'NOT_FOUND');
    }

    // Vendor yalnız öz məhsulunun şəklini silə bilər
    if (req.user!.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user!.id },
      });
      if (image.product.vendorId !== vendor?.id) {
        throw new AppError('İcazə yoxdur', 403, 'FORBIDDEN');
      }
    }

    // Cloudinary-dən sil
    const publicId = extractPublicId(image.url);
    if (publicId) await deleteImage(publicId);

    // DB-dən sil
    await prisma.productImage.delete({ where: { id: imageId } });

    successResponse(res, { message: 'Şəkil uğurla silindi' });
  }
);

// Cloudinary URL-dən publicId çıxar
function extractPublicId(url: string): string | null {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts.slice(-3, -1).join('/');
    return `${folder}/${filename}`;
  } catch {
    return null;
  }
}
```

### 6.2 Avatar Yükləmə

```typescript
// src/controllers/userController.ts

import { uploadImage, deleteImage } from '../utils/cloudinaryUpload';

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      throw new AppError('Şəkil faylı tələb olunur', 400, 'VALIDATION_ERROR');
    }

    // Köhnə avatar-ı sil (varsa)
    const user = await prisma.user.findUnique({
      where:  { id: req.user!.id },
      select: { avatar: true },
    });

    if (user?.avatar) {
      const oldPublicId = extractPublicId(user.avatar);
      if (oldPublicId) await deleteImage(oldPublicId);
    }

    // Yeni avatar yüklə
    const result = await uploadImage(
      file.buffer,
      'shopflow/avatars',
      {
        publicId: `user-${req.user!.id}`,
        maxWidth:  400,
        maxHeight: 400,
        quality:   'auto',
      }
    );

    // DB-ni yenilə
    const updatedUser = await prisma.user.update({
      where:  { id: req.user!.id },
      data:   { avatar: result.url },
      select: { id: true, name: true, email: true, avatar: true },
    });

    successResponse(res, {
      message: 'Avatar uğurla yeniləndi',
      data:    { avatar: updatedUser.avatar },
    });
  }
);
```

---

## 7. Route-larda Multer İstifadəsi

```typescript
// src/routes/productRoutes.ts

import { productImageUpload } from '../middleware/uploadMiddleware';

// Məhsul yarat — max 5 şəkil
router.post(
  '/',
  protect,
  authorize('ADMIN', 'VENDOR'),
  productImageUpload.array('images', 5),   // FormData-da "images" field adı
  createProductValidation,
  validate,
  createProduct
);

// Məhsula şəkil əlavə et
router.post(
  '/:id/images',
  protect,
  authorize('ADMIN', 'VENDOR'),
  productImageUpload.array('images', 5),
  addProductImages
);

// Məhsul şəklini sil
router.delete(
  '/:id/images/:imageId',
  protect,
  authorize('ADMIN', 'VENDOR'),
  deleteProductImage
);

// src/routes/userRoutes.ts
router.post(
  '/me/avatar',
  protect,
  avatarUpload.single('avatar'),           // FormData-da "avatar" field adı
  uploadAvatar
);
```

---

## 8. Frontend — Next.js Image Optimallaşması

### 8.1 `next/image` Konfiqurasiyası

```typescript
// next.config.ts

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/shopflow/**',        // Yalnız shopflow qovluğu
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',  // Google avatar
      },
    ],
    formats:          ['image/avif', 'image/webp'],
    minimumCacheTTL:  86400,            // 24 saat cache
    deviceSizes:      [640, 750, 828, 1080, 1200, 1920],
    imageSizes:       [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### 8.2 Komponentlərdə Düzgün İstifadə

```tsx
// components/shop/ProductCard.tsx — Siyahı şəkli
import Image from 'next/image';

// ✅ Düzgün — fill + sizes ilə
<div className="relative aspect-square overflow-hidden rounded-xl">
  <Image
    src={product.image.url}
    alt={product.image.alt || product.name}
    fill
    sizes="(max-width: 640px) 50vw,
           (max-width: 1024px) 33vw,
           25vw"
    className="object-cover transition-transform group-hover:scale-105"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  />
</div>

// ✅ Hero şəkil — priority={true} (LCP optimallaşması)
<Image
  src={product.images[0].url}
  alt={product.name}
  width={1200}
  height={800}
  priority={true}              // İlk ekranda görünən şəkil
  className="w-full object-cover"
/>

// ✅ Avatar — sabit ölçü
<Image
  src={user.avatar ?? '/default-avatar.png'}
  alt={user.name}
  width={40}
  height={40}
  className="rounded-full object-cover"
/>

// ❌ Pis — unoptimized img tag
<img src={product.image.url} alt={product.name} />

// ❌ Pis — sizes verilməyib (layout shift baş verə bilər)
<Image src={url} alt={alt} fill />
```

### 8.3 Cloudinary URL Transformasiyası (Frontend)

```typescript
// src/utils/cloudinaryUrl.ts

/**
 * Cloudinary URL-ə transformasiya parametrləri əlavə et
 * Backend upload etdikdən sonra URL-i frontend-də dəyişmək üçün
 */
export const getCloudinaryUrl = (
  url:     string,
  options: {
    width?:   number;
    height?:  number;
    crop?:    'fill' | 'fit' | 'thumb' | 'scale' | 'limit';
    quality?: number | 'auto';
    format?:  'webp' | 'avif' | 'auto';
    gravity?: 'face' | 'center' | 'auto';
  } = {}
): string => {
  if (!url.includes('cloudinary.com')) return url;

  const transforms: string[] = [];

  if (options.width)   transforms.push(`w_${options.width}`);
  if (options.height)  transforms.push(`h_${options.height}`);
  if (options.crop)    transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);
  transforms.push(`q_${options.quality ?? 'auto'}`);
  transforms.push(`f_${options.format  ?? 'auto'}`);

  // URL strukturu:
  // https://res.cloudinary.com/{cloud}/image/upload/{transforms}/v123/{publicId}.{ext}
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
};

// ── İstifadə nümunələri ──────────────────────────────────

// Məhsul kartı thumbnail (300x300)
getCloudinaryUrl(product.image.url, {
  width: 300, height: 300, crop: 'fill', gravity: 'center',
});
// → .../upload/w_300,h_300,c_fill,g_center,q_auto,f_auto/...

// Məhsul detalı böyük şəkil (1200px gen)
getCloudinaryUrl(product.image.url, {
  width: 1200, crop: 'limit', quality: 'auto',
});

// Avatar (80x80, üz mərkəzi)
getCloudinaryUrl(user.avatar, {
  width: 80, height: 80, crop: 'thumb', gravity: 'face',
});
```

---

## 9. Blur Placeholder Generasiyası

```typescript
// src/utils/getBlurDataUrl.ts
// Şəkil yüklənənə qədər bulanıq placeholder

import { cloudinary } from '../config/cloudinary';

/**
 * Kiçik base64 şəkil — Next.js blurDataURL üçün
 */
export const getBlurDataUrl = async (publicId: string): Promise<string> => {
  try {
    const result = await cloudinary.url(publicId, {
      transformation: [
        { width: 10, quality: 10, fetch_format: 'auto' },
      ],
      sign_url: false,
    });

    const response = await fetch(result);
    const buffer   = await response.arrayBuffer();
    const base64   = Buffer.from(buffer).toString('base64');
    const mimeType = 'image/webp';

    return `data:${mimeType};base64,${base64}`;
  } catch {
    // Fallback — boz rəng
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAARC';
  }
};

// Məhsul yaratma zamanı — hər şəkil üçün blur URL al:
// const blurUrl = await getBlurDataUrl(uploadResult.publicId);
// Bunu DB-yə ProductImage.blurDataUrl kimi saxla
```

---

## 10. Fayl Ölçüsü Xəta İdarəsi

```typescript
// src/middleware/errorMiddleware.ts — Multer xətaları

import { MulterError } from 'multer';

// Global error handler-da:
if (err instanceof MulterError) {
  const messages: Record<string, string> = {
    LIMIT_FILE_SIZE:  'Fayl ölçüsü həddindən böyükdür',
    LIMIT_FILE_COUNT: 'Çox fayl seçildi (max 5)',
    LIMIT_FIELD_KEY:  'Fayl sahəsi adı çox uzundur',
    LIMIT_UNEXPECTED_FILE: 'Gözlənilməyən fayl sahəsi',
  };

  res.status(400).json({
    success:    false,
    message:    messages[err.code] ?? 'Fayl yükləmə xətası',
    error:      'UPLOAD_ERROR',
    statusCode: 400,
  });
  return;
}

// Fayl tipi xətası (fileFilter-dən)
if (err.message.includes('formatları icazəlidir')) {
  res.status(400).json({
    success:    false,
    message:    err.message,
    error:      'INVALID_FILE_TYPE',
    statusCode: 400,
  });
  return;
}
```

---

## 11. Şəkil Limiti Cədvəli

| Kontent növü | Max ölçü | Max say | Tövsiyə olunan ölçü | Format |
|---|---|---|---|---|
| Məhsul şəkli | 5MB | 5 | 1200×1200px | JPG/PNG/WEBP |
| Avatar | 2MB | 1 | 400×400px | JPG/PNG/WEBP |
| Kateqoriya şəkli | 3MB | 1 | 800×600px | JPG/PNG/WEBP |
| Vendor logosu | 2MB | 1 | 400×400px | JPG/PNG/WEBP |
| Vendor banneri | 5MB | 1 | 1920×600px | JPG/PNG/WEBP |

---

## 12. Media Qaydaları

```
BACKEND
  ✅  Memory storage — disk yazmırıq
  ✅  Hər zaman Cloudinary-ə yüklə, URL-i DB-yə saxla
  ✅  Fayl tipi yoxlaması (MIME type)
  ✅  Fayl ölçüsü məhdudiyyəti
  ✅  Köhnə şəkli sil (avatar yenilənəndə)
  ✅  Cloudinary qovluq strukturunu qoru
  ✅  Yükləmə xətaları loglanır
  ❌  Server diskində şəkil saxlama
  ❌  Fayl adını istifadəçidən al

FRONTEND
  ✅  next/image — HƏR şəkil üçün
  ✅  sizes prop — responsive breakpoint-lər
  ✅  priority={true} — yalnız LCP şəkilləri üçün
  ✅  placeholder="blur" + blurDataURL
  ✅  alt mətn — SEO + accessibility
  ✅  aspect-ratio container — layout shift yoxdur
  ❌  <img> tagi birbaşa istifadəsi
  ❌  width/height verilmədən fill istifadəsi
  ❌  priority={true} siyahıdakı bütün şəkillərə
```
