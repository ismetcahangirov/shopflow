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
  body('address').optional().trim().isLength({ max: 300 }).withMessage('Ünvan çox uzundur'),
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

export const getVendorOrdersValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Səhifə nömrəsi müsbət ədəd olmalıdır'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),
  query('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Yanlış status'),
];

export const getVendorSalesValidators = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Düzgün başlanğıc tarixi daxil edin'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Düzgün bitmə tarixi daxil edin'),
  query('groupBy')
    .optional()
    .isIn(['day', 'month', 'year']).withMessage('Qruplaşdırma day, month və ya year olmalıdır'),
];

export const dashboardPeriodValidators = [
  query('period')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Period 1-365 gün arasında olmalıdır'),
];
