// src/validators/categoryValidators.ts
// Zod-based request validators for Category CRUD endpoints

import { body, param } from 'express-validator';

export const createCategoryValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Kateqoriya adı tələb olunur')
    .isLength({ min: 2, max: 100 })
    .withMessage('Ad 2-100 simvol olmalıdır'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug yalnız kiçik hərf, rəqəm və tire içerə bilər')
    .isLength({ min: 2, max: 120 })
    .withMessage('Slug 2-120 simvol olmalıdır'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Açıqlama 1000 simvoldan çox ola bilməz'),

  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Şəkil etibarlı URL olmalıdır'),

  body('parentId')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('parentId string olmalıdır'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive boolean olmalıdır'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sortOrder müsbət tam ədəd olmalıdır'),

  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('metaTitle 160 simvoldan çox ola bilməz'),

  body('metaDesc')
    .optional()
    .trim()
    .isLength({ max: 320 })
    .withMessage('metaDesc 320 simvoldan çox ola bilməz'),
];

export const updateCategoryValidators = [
  param('id').notEmpty().withMessage('Kateqoriya ID-si tələb olunur'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ad 2-100 simvol olmalıdır'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug yalnız kiçik hərf, rəqəm və tire içerə bilər')
    .isLength({ min: 2, max: 120 })
    .withMessage('Slug 2-120 simvol olmalıdır'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Açıqlama 1000 simvoldan çox ola bilməz'),

  body('image')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(value)) throw new Error('Şəkil etibarlı URL olmalıdır');
      return true;
    }),

  body('parentId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (typeof value !== 'string') throw new Error('parentId string olmalıdır');
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive boolean olmalıdır'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sortOrder müsbət tam ədəd olmalıdır'),

  body('metaTitle')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 160 })
    .withMessage('metaTitle 160 simvoldan çox ola bilməz'),

  body('metaDesc')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 320 })
    .withMessage('metaDesc 320 simvoldan çox ola bilməz'),
];

export const categoryIdParamValidator = [
  param('id').notEmpty().withMessage('Kateqoriya ID-si tələb olunur'),
];

export const categorySlugParamValidator = [
  param('slug')
    .notEmpty()
    .withMessage('Kateqoriya slug-u tələb olunur')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug yalnız kiçik hərf, rəqəm və tire içerə bilər'),
];
