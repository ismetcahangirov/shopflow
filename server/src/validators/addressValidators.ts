// src/validators/addressValidators.ts
// express-validator rules for Address management endpoints

import { body, param } from 'express-validator';

export const createAddressValidators = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Ad və soyad tələb olunur')
    .isLength({ min: 2, max: 100 }).withMessage('Ad və soyad 2-100 simvol olmalıdır'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Telefon nömrəsi tələb olunur')
    .matches(/^\+?[0-9\s\-()]{7,20}$/).withMessage('Düzgün telefon nömrəsi daxil edin'),

  body('city')
    .trim()
    .notEmpty().withMessage('Şəhər tələb olunur')
    .isLength({ max: 100 }).withMessage('Şəhər adı çox uzundur'),

  body('district')
    .trim()
    .notEmpty().withMessage('Rayon tələb olunur')
    .isLength({ max: 100 }).withMessage('Rayon adı çox uzundur'),

  body('street')
    .trim()
    .notEmpty().withMessage('Küçə tələb olunur')
    .isLength({ max: 200 }).withMessage('Küçə adı çox uzundur'),

  body('building')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Bina nömrəsi çox uzundur'),

  body('apartment')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Mənzil nömrəsi çox uzundur'),

  body('zip')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Poçt indeksi çox uzundur'),

  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault boolean olmalıdır'),
];

export const updateAddressValidators = [
  param('id')
    .notEmpty().withMessage('Ünvan ID-si tələb olunur'),

  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Ad və soyad 2-100 simvol olmalıdır'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-()]{7,20}$/).withMessage('Düzgün telefon nömrəsi daxil edin'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Şəhər adı çox uzundur'),

  body('district')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Rayon adı çox uzundur'),

  body('street')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Küçə adı çox uzundur'),

  body('building')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Bina nömrəsi çox uzundur'),

  body('apartment')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Mənzil nömrəsi çox uzundur'),

  body('zip')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Poçt indeksi çox uzundur'),

  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault boolean olmalıdır'),
];

export const addressIdParamValidator = [
  param('id')
    .notEmpty().withMessage('Ünvan ID-si tələb olunur'),
];
