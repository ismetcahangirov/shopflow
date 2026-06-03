// src/validators/vendorValidators.ts
import { body, param, query } from 'express-validator';

export const applyVendorValidators = [
  body('storeName').trim().notEmpty().withMessage('Mağaza adı tələb olunur').isLength({ min: 2, max: 100 }).withMessage('Mağaza adı 2-100 simvol olmalıdır'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('phone').optional().trim(),
];

export const updateVendorStatusValidators = [
  param('id').notEmpty().withMessage('Satıcı ID-si tələb olunur'),
  body('status').trim().notEmpty().isIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).withMessage('Yanlış status'),
  body('note').optional().trim(),
];

export const updateMyVendorValidators = [
  body('storeName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Mağaza adı 2-100 simvol olmalıdır'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('phone').optional().trim(),
];

export const getVendorsValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Səhifə nömrəsi müsbət ədəd olmalıdır'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).withMessage('Yanlış status'),
];
