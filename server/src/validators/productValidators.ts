// src/validators/productValidators.ts
// express-validator rules for Product CRUD endpoints

import { body, param, query, ValidationChain } from 'express-validator';

// ── Shared price validator ──────────────────────────────────
const priceField = (field: string, required = true): ValidationChain => {
  const chain = body(field);
  return required
    ? chain.notEmpty().withMessage(`${field} tələb olunur`).isFloat({ min: 0 }).withMessage(`${field} müsbət rəqəm olmalıdır`)
    : chain.optional({ nullable: true }).isFloat({ min: 0 }).withMessage(`${field} müsbət rəqəm olmalıdır`);
};

// ── POST /api/products ─────────────────────────────────────
export const createProductValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Məhsul adı tələb olunur')
    .isLength({ min: 2, max: 200 }).withMessage('Ad 2-200 simvol olmalıdır'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/).withMessage('Slug yalnız kiçik hərf, rəqəm və tire içerə bilər')
    .isLength({ min: 2, max: 220 }).withMessage('Slug 2-220 simvol olmalıdır'),

  body('description')
    .trim()
    .notEmpty().withMessage('Açıqlama tələb olunur')
    .isLength({ max: 5000 }).withMessage('Açıqlama 5000 simvoldan çox ola bilməz'),

  body('shortDesc')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Qısa açıqlama 500 simvoldan çox ola bilməz'),

  priceField('price'),
  priceField('comparePrice', false),
  priceField('costPrice', false),

  body('sku')
    .trim()
    .notEmpty().withMessage('SKU tələb olunur')
    .isLength({ max: 100 }).withMessage('SKU 100 simvoldan çox ola bilməz'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stok 0 və ya daha çox olmalıdır'),

  body('categoryId')
    .trim()
    .notEmpty().withMessage('Kateqoriya ID-si tələb olunur'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brend 100 simvoldan çox ola bilməz'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags massiv olmalıdır'),

  body('tags.*')
    .optional()
    .trim()
    .isString().withMessage('Hər tag string olmalıdır'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive boolean olmalıdır'),

  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured boolean olmalıdır'),

  body('weight')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Çəki müsbət rəqəm olmalıdır'),

  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 160 }).withMessage('metaTitle 160 simvoldan çox ola bilməz'),

  body('metaDesc')
    .optional()
    .trim()
    .isLength({ max: 320 }).withMessage('metaDesc 320 simvoldan çox ola bilməz'),
];

// ── PUT /api/products/:id ──────────────────────────────────
export const updateProductValidators = [
  param('id').notEmpty().withMessage('Məhsul ID-si tələb olunur'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Ad 2-200 simvol olmalıdır'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/).withMessage('Slug yalnız kiçik hərf, rəqəm və tire içerə bilər')
    .isLength({ min: 2, max: 220 }).withMessage('Slug 2-220 simvol olmalıdır'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Açıqlama 5000 simvoldan çox ola bilməz'),

  body('shortDesc')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Qısa açıqlama 500 simvoldan çox ola bilməz'),

  priceField('price', false),
  priceField('comparePrice', false),
  priceField('costPrice', false),

  body('sku')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('SKU 100 simvoldan çox ola bilməz'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stok 0 və ya daha çox olmalıdır'),

  body('categoryId')
    .optional()
    .trim()
    .notEmpty().withMessage('Kateqoriya ID-si boş ola bilməz'),

  body('brand')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Brend 100 simvoldan çox ola bilməz'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags massiv olmalıdır'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive boolean olmalıdır'),

  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured boolean olmalıdır'),

  body('weight')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Çəki müsbət rəqəm olmalıdır'),

  body('metaTitle')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 160 }).withMessage('metaTitle 160 simvoldan çox ola bilməz'),

  body('metaDesc')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 320 }).withMessage('metaDesc 320 simvoldan çox ola bilməz'),
];

// ── GET /api/products query validators ───────────────────
export const listProductsValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Səhifə 1 və ya daha çox olmalıdır'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum qiymət müsbət olmalıdır'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maksimum qiymət müsbət olmalıdır'),

  query('sort')
    .optional()
    .isIn(['price_asc', 'price_desc', 'newest', 'popular', 'rating'])
    .withMessage('Sıralama növü yanlışdır'),
];

// ── Param validators ───────────────────────────────────────
export const productIdParamValidator = [
  param('id').notEmpty().withMessage('Məhsul ID-si tələb olunur'),
];

export const productSlugParamValidator = [
  param('slug')
    .notEmpty().withMessage('Məhsul slug-u tələb olunur')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug yalnız kiçik hərf, rəqəm və tire içerə bilər'),
];

export const imageIdParamValidator = [
  param('id').notEmpty().withMessage('Məhsul ID-si tələb olunur'),
  param('imageId').notEmpty().withMessage('Şəkil ID-si tələb olunur'),
];

export const searchProductsValidators = [
  query('q')
    .optional()
    .trim()
    .isString().withMessage('Axtarış mətni düzgün olmalıdır')
    .isLength({ max: 100 }).withMessage('Axtarış mətni 100 simvoldan çox ola bilməz'),
];

