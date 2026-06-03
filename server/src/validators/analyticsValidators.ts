// src/validators/analyticsValidators.ts
import { query } from 'express-validator';

export const dashboardValidators = [
  query('period')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Period 1-365 gün arasında olmalıdır'),
];

export const salesChartValidators = [
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
