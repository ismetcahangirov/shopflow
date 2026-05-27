// src/controllers/categoryController.ts
// Category CRUD — GET (tree), GET (slug), POST, PUT, DELETE

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { slugify } from '../utils/slugify';
import { logger } from '../config/logger';

// ── Shared select shapes ──────────────────────────────────

const CATEGORY_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  isActive: true,
  sortOrder: true,
  metaTitle: true,
  metaDesc: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ── GET /api/categories ───────────────────────────────────
// Returns top-level active categories with up to 2 levels of children
export const getCategories = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      select: {
        ...CATEGORY_SELECT,
        children: {
          where: { isActive: true },
          select: {
            ...CATEGORY_SELECT,
            children: {
              where: { isActive: true },
              select: CATEGORY_SELECT,
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    successResponse(res, { message: 'Kateqoriyalar uğurla gətirildi', data: { categories } });
  },
);

// ── GET /api/categories/:slug ─────────────────────────────
export const getCategoryBySlug = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const slug = req.params['slug'] as string;

    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        ...CATEGORY_SELECT,
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: CATEGORY_SELECT,
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new AppError('Kateqoriya tapılmadı', 404, 'CATEGORY_NOT_FOUND');
    }

    successResponse(res, { message: 'Kateqoriya uğurla gətirildi', data: { category } });
  },
);

// ── POST /api/categories ──────────────────────────────────
export const createCategory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const {
      name,
      slug: rawSlug,
      description,
      image,
      parentId,
      isActive,
      sortOrder,
      metaTitle,
      metaDesc,
    } = req.body as {
      name: string;
      slug?: string;
      description?: string;
      image?: string;
      parentId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
      metaTitle?: string;
      metaDesc?: string;
    };

    const slug = rawSlug ?? slugify(name);

    // Uniqueness check
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Bu slug artıq mövcuddur', 409, 'SLUG_CONFLICT');
    }

    // Validate parentId if provided
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw new AppError('Ana kateqoriya tapılmadı', 404, 'PARENT_NOT_FOUND');
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description ?? null,
        image: image ?? null,
        parentId: parentId ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
      },
      select: CATEGORY_SELECT,
    });

    logger.info(`Category created: ${category.slug} by user ${req.user?.id}`);

    successResponse(res, {
      statusCode: 201,
      message: 'Kateqoriya uğurla yaradıldı',
      data: { category },
    });
  },
);

// ── PUT /api/categories/:id ───────────────────────────────
export const updateCategory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;
    const {
      name,
      slug: rawSlug,
      description,
      image,
      parentId,
      isActive,
      sortOrder,
      metaTitle,
      metaDesc,
    } = req.body as {
      name?: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
      parentId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
      metaTitle?: string | null;
      metaDesc?: string | null;
    };

    // Check category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Kateqoriya tapılmadı', 404, 'CATEGORY_NOT_FOUND');
    }

    // Prevent self-reference as parent
    if (parentId === id) {
      throw new AppError('Kateqoriya özünə ana kateqoriya ola bilməz', 400, 'SELF_REFERENCE');
    }

    // Slug uniqueness on change
    if (rawSlug && rawSlug !== existing.slug) {
      const slugConflict = await prisma.category.findUnique({ where: { slug: rawSlug } });
      if (slugConflict) {
        throw new AppError('Bu slug artıq mövcuddur', 409, 'SLUG_CONFLICT');
      }
    }

    // Validate new parentId
    if (parentId !== undefined && parentId !== null) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw new AppError('Ana kateqoriya tapılmadı', 404, 'PARENT_NOT_FOUND');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(rawSlug !== undefined && { slug: rawSlug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(parentId !== undefined && { parentId }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
      },
      select: CATEGORY_SELECT,
    });

    logger.info(`Category updated: ${category.slug} by user ${req.user?.id}`);

    successResponse(res, { message: 'Kateqoriya uğurla yeniləndi', data: { category } });
  },
);

// ── DELETE /api/categories/:id ────────────────────────────
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params['id'] as string;

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        _count: { select: { products: true, children: true } },
      },
    });

    if (!category) {
      throw new AppError('Kateqoriya tapılmadı', 404, 'CATEGORY_NOT_FOUND');
    }

    if (category._count.products > 0) {
      throw new AppError(
        `Bu kateqoriyada ${category._count.products} məhsul var. Əvvəlcə məhsulları köçürün`,
        409,
        'CATEGORY_HAS_PRODUCTS',
      );
    }

    if (category._count.children > 0) {
      throw new AppError(
        `Bu kateqoriyanın ${category._count.children} alt kateqoriyası var. Əvvəlcə onları silin`,
        409,
        'CATEGORY_HAS_CHILDREN',
      );
    }

    await prisma.category.delete({ where: { id } });

    logger.info(`Category deleted: ${category.slug} by user ${req.user?.id}`);

    successResponse(res, { message: 'Kateqoriya uğurla silindi' });
  },
);

// ── POST /api/categories/upload ───────────────────────────
export const uploadCategoryImage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.file) {
      throw new AppError('Heç bir şəkil faylı tapılmadı', 400, 'FILE_MISSING');
    }

    const { uploadToCloudinary } = await import('../middleware/uploadMiddleware');
    const result = await uploadToCloudinary(req.file.buffer, 'categories');

    successResponse(res, {
      message: 'Şəkil uğurla yükləndi',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  },
);
