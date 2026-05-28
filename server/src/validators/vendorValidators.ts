// src/validators/vendorValidators.ts
import { body, param } from 'express-validator';

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
