// src/validators/reviewValidators.ts
import { body, param, query } from 'express-validator';

export const createReviewValidators = [
  body('productId').trim().notEmpty().withMessage('Məhsul ID-si tələb olunur'),
  body('rating')
    .notEmpty().withMessage('Reytinq tələb olunur')
    .isInt({ min: 1, max: 5 }).withMessage('Reytinq 1-5 arasında olmalıdır'),
  body('body').trim().notEmpty().withMessage('Rəy mətni tələb olunur'),
  body('title').optional().trim(),
];

export const reviewIdParamValidator = [
  param('id').notEmpty().withMessage('Rəy ID-si tələb olunur'),
];

export const getReviewsValidators = [
  query('productId').optional().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('Səhifə nömrəsi müsbət ədəd olmalıdır'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit 1-50 arasında olmalıdır'),
];

