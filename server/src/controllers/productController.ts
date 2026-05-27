// src/controllers/productController.ts
// Product CRUD — GET (list), GET (slug), GET (featured), GET (search),
//                POST, PUT, DELETE, POST (images), DELETE (image)

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { slugify } from '../utils/slugify';
import { logger } from '../config/logger';

// ── Constants ─────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const FEATURED_LIMIT = 12;
const SEARCH_LIMIT = 10;

// ── Shared select shape ───────────────────────────────────

const PRODUCT_LIST_SELECT = {
  id: true,
  name: true,
  slug: true,
  shortDesc: true,
  price: true,
  comparePrice: true,
  sku: true,
  stock: true,
  isActive: true,
  isFeatured: true,
  avgRating: true,
  reviewCount: true,
  salesCount: true,
  brand: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  vendor: { select: { id: true, storeName: true } },
  images: {
    where: { isMain: true },
    select: { id: true, url: true, alt: true },
    take: 1,
  },
} as const;

const PRODUCT_DETAIL_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  shortDesc: true,
  price: true,
  comparePrice: true,
  costPrice: true,
  sku: true,
  barcode: true,
  stock: true,
  lowStockAlert: true,
  weight: true,
  brand: true,
  isActive: true,
  isFeatured: true,
  tags: true,
  avgRating: true,
  reviewCount: true,
  salesCount: true,
  metaTitle: true,
  metaDesc: true,
  categoryId: true,
  vendorId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  vendor: { select: { id: true, storeName: true } },
  images: {
    select: { id: true, url: true, alt: true, sortOrder: true, isMain: true },
    orderBy: { sortOrder: 'asc' as const },
  },
  attributes: { select: { id: true, name: true, value: true } },
  variants: {
    select: { id: true, name: true, sku: true, price: true, stock: true, image: true },
  },
} as const;

// ── Request body type ─────────────────────────────────────

interface ProductBody {
  name?: string;
  slug?: string;
  description?: string;
  shortDesc?: string | null;
  price?: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  sku?: string;
  barcode?: string | null;
  stock?: number;
  lowStockAlert?: number;
  weight?: number | null;
  brand?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  categoryId?: string;
  vendorId?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
}

// ── GET /api/products ─────────────────────────────────────
export const getProducts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const {
      page: pageStr = '1',
      limit: limitStr = String(DEFAULT_PAGE_SIZE),
      search,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      sort = 'newest',
      featured,
      brand,
      inStock,
    } = req.query as Record<string, string | undefined>;

    const page = Math.max(1, parseInt(pageStr, 10));
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limitStr, 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (minPrice !== undefined) {
      where.price = { ...((where.price as object) ?? {}), gte: parseFloat(minPrice) };
    }
    if (maxPrice !== undefined) {
      where.price = { ...((where.price as object) ?? {}), lte: parseFloat(maxPrice) };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    // Build orderBy clause
    const orderByMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      newest: { createdAt: 'desc' },
      popular: { salesCount: 'desc' },
      rating: { avgRating: 'desc' },
    };
    const orderBy = orderByMap[sort] ?? orderByMap['newest'];

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, select: PRODUCT_LIST_SELECT, orderBy, skip, take: limit }),
      prisma.product.count({ where }),
    ]);

    successResponse(res, {
      message: 'Məhsullar uğurla gətirildi',
      data: { products },
      pagination: { total, pages: Math.ceil(total / limit), page, limit },
    });
  },
);

// ── GET /api/products/featured ────────────────────────────
export const getFeaturedProducts = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: PRODUCT_LIST_SELECT,
      orderBy: { salesCount: 'desc' },
      take: FEATURED_LIMIT,
    });

    successResponse(res, { message: 'Önə çıxan məhsullar gətirildi', data: { products } });
  },
);

// ── GET /api/products/search ──────────────────────────────
export const searchProducts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const q = (req.query['q'] as string | undefined)?.trim() ?? '';

    if (!q || q.length < 2) {
      successResponse(res, { message: 'Axtarış nəticələri', data: { products: [] } });
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: { where: { isMain: true }, select: { url: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
      take: SEARCH_LIMIT,
      orderBy: { salesCount: 'desc' },
    });

    successResponse(res, { message: 'Axtarış nəticələri', data: { products } });
  },
);

// ── GET /api/products/:slug ───────────────────────────────
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const slug = req.params['slug'] as string;

    const product = await prisma.product.findUnique({
      where: { slug },
      select: PRODUCT_DETAIL_SELECT,
    });

    if (!product || !product.isActive) {
      throw new AppError('Məhsul tapılmadı', 404, 'PRODUCT_NOT_FOUND');
    }

    successResponse(res, { message: 'Məhsul uğurla gətirildi', data: { product } });
  },
);

// ── POST /api/products ────────────────────────────────────
export const createProduct = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const {
      name,
      slug: rawSlug,
      description,
      shortDesc,
      price,
      comparePrice,
      costPrice,
      sku,
      barcode,
      stock,
      lowStockAlert,
      weight,
      brand,
      isActive,
      isFeatured,
      tags,
      categoryId,
      vendorId,
      metaTitle,
      metaDesc,
    } = req.body as ProductBody;

    const resolvedName = name ?? '';
    const slug = rawSlug ?? slugify(resolvedName);

    // Slug uniqueness
    const slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) {
      throw new AppError('Bu slug artıq mövcuddur', 409, 'SLUG_CONFLICT');
    }

    // SKU uniqueness
    const skuExists = await prisma.product.findUnique({ where: { sku } });
    if (skuExists) {
      throw new AppError('Bu SKU artıq istifadə olunur', 409, 'SKU_CONFLICT');
    }

    // Category check
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new AppError('Kateqoriya tapılmadı', 404, 'CATEGORY_NOT_FOUND');
    }

    // Vendor check if vendorId provided
    if (vendorId) {
      const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
      if (!vendor) {
        throw new AppError('Satıcı tapılmadı', 404, 'VENDOR_NOT_FOUND');
      }
    }

    // Validators guarantee name, description, price, sku, categoryId are present
    const product = await prisma.product.create({
      data: {
        name: resolvedName,
        slug,
        description: description ?? '',
        shortDesc: shortDesc ?? null,
        price: price ?? 0,
        comparePrice: comparePrice ?? null,
        costPrice: costPrice ?? null,
        sku: sku ?? '',
        barcode: barcode ?? null,
        stock: stock ?? 0,
        lowStockAlert: lowStockAlert ?? 5,
        weight: weight ?? null,
        brand: brand ?? null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        tags: tags ?? [],
        categoryId: categoryId ?? '',
        vendorId: vendorId ?? null,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
      },
      select: PRODUCT_DETAIL_SELECT,
    });

    logger.info(`Product created: ${product.slug} by user ${req.user?.id}`);

    successResponse(res, {
      statusCode: 201,
      message: 'Məhsul uğurla yaradıldı',
      data: { product },
    });
  },
);

// ── PUT /api/products/:id ─────────────────────────────────
export const updateProduct = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;
    const {
      name,
      slug: rawSlug,
      description,
      shortDesc,
      price,
      comparePrice,
      costPrice,
      sku,
      barcode,
      stock,
      lowStockAlert,
      weight,
      brand,
      isActive,
      isFeatured,
      tags,
      categoryId,
      vendorId,
      metaTitle,
      metaDesc,
    } = req.body as ProductBody;

    // Existence check
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Məhsul tapılmadı', 404, 'PRODUCT_NOT_FOUND');
    }

    // Ownership check — Vendor can only edit own products
    if (req.user?.role === 'VENDOR' && existing.vendorId !== req.user.id) {
      throw new AppError('Bu əməliyyat üçün icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    // Slug uniqueness
    if (rawSlug && rawSlug !== existing.slug) {
      const conflict = await prisma.product.findUnique({ where: { slug: rawSlug } });
      if (conflict) {
        throw new AppError('Bu slug artıq mövcuddur', 409, 'SLUG_CONFLICT');
      }
    }

    // SKU uniqueness
    if (sku && sku !== existing.sku) {
      const conflict = await prisma.product.findUnique({ where: { sku } });
      if (conflict) {
        throw new AppError('Bu SKU artıq istifadə olunur', 409, 'SKU_CONFLICT');
      }
    }

    // Category check
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        throw new AppError('Kateqoriya tapılmadı', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(rawSlug !== undefined && { slug: rawSlug }),
        ...(description !== undefined && { description }),
        ...(shortDesc !== undefined && { shortDesc }),
        ...(price !== undefined && { price }),
        ...(comparePrice !== undefined && { comparePrice }),
        ...(costPrice !== undefined && { costPrice }),
        ...(sku !== undefined && { sku }),
        ...(barcode !== undefined && { barcode }),
        ...(stock !== undefined && { stock }),
        ...(lowStockAlert !== undefined && { lowStockAlert }),
        ...(weight !== undefined && { weight }),
        ...(brand !== undefined && { brand }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(tags !== undefined && { tags }),
        ...(categoryId !== undefined && { categoryId }),
        ...(vendorId !== undefined && { vendorId }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
      },
      select: PRODUCT_DETAIL_SELECT,
    });

    logger.info(`Product updated: ${product.slug} by user ${req.user?.id}`);

    successResponse(res, { message: 'Məhsul uğurla yeniləndi', data: { product } });
  },
);

// ── DELETE /api/products/:id ──────────────────────────────
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true, vendorId: true, _count: { select: { orderItems: true } } },
    });

    if (!product) {
      throw new AppError('Məhsul tapılmadı', 404, 'PRODUCT_NOT_FOUND');
    }

    // Vendor can only delete own products
    if (req.user?.role === 'VENDOR' && product.vendorId !== req.user.id) {
      throw new AppError('Bu əməliyyat üçün icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    // Block if product has orders
    if (product._count.orderItems > 0) {
      throw new AppError(
        `Bu məhsulun ${product._count.orderItems} sifarişi var. Silmək əvəzinə deaktiv edin`,
        409,
        'PRODUCT_HAS_ORDERS',
      );
    }

    await prisma.product.delete({ where: { id } });

    logger.info(`Product deleted: ${product.slug} by user ${req.user?.id}`);

    successResponse(res, { message: 'Məhsul uğurla silindi' });
  },
);

// ── POST /api/products/:id/images ─────────────────────────
export const addProductImage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;

    const product = await prisma.product.findUnique({ where: { id }, select: { id: true, vendorId: true } });
    if (!product) {
      throw new AppError('Məhsul tapılmadı', 404, 'PRODUCT_NOT_FOUND');
    }

    if (req.user?.role === 'VENDOR' && product.vendorId !== req.user.id) {
      throw new AppError('Bu əməliyyat üçün icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    if (!req.file) {
      throw new AppError('Şəkil faylı tapılmadı', 400, 'FILE_MISSING');
    }

    const { uploadToCloudinary } = await import('../middleware/uploadMiddleware');
    const result = await uploadToCloudinary(req.file.buffer, 'products');

    // Make first image the main one
    const existingCount = await prisma.productImage.count({ where: { productId: id } });

    const image = await prisma.productImage.create({
      data: {
        url: result.secure_url,
        alt: (req.body as { alt?: string }).alt ?? null,
        isMain: existingCount === 0,
        sortOrder: existingCount,
        productId: id,
      },
      select: { id: true, url: true, alt: true, isMain: true, sortOrder: true },
    });

    logger.info(`Product image added: product=${id} by user ${req.user?.id}`);

    successResponse(res, { statusCode: 201, message: 'Şəkil uğurla əlavə edildi', data: { image } });
  },
);

// ── DELETE /api/products/:id/images/:imageId ──────────────
export const deleteProductImage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;
    const imageId = req.params['imageId'] as string;

    const product = await prisma.product.findUnique({ where: { id }, select: { id: true, vendorId: true } });
    if (!product) {
      throw new AppError('Məhsul tapılmadı', 404, 'PRODUCT_NOT_FOUND');
    }

    if (req.user?.role === 'VENDOR' && product.vendorId !== req.user.id) {
      throw new AppError('Bu əməliyyat üçün icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
    if (!image) {
      throw new AppError('Şəkil tapılmadı', 404, 'IMAGE_NOT_FOUND');
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    // If deleted image was main, promote next image
    if (image.isMain) {
      const next = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { sortOrder: 'asc' },
      });
      if (next) {
        await prisma.productImage.update({ where: { id: next.id }, data: { isMain: true } });
      }
    }

    logger.info(`Product image deleted: image=${imageId} product=${id} by user ${req.user?.id}`);

    successResponse(res, { message: 'Şəkil uğurla silindi' });
  },
);
