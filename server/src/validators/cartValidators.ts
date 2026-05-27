// src/validators/cartValidators.ts
// express-validator rules for Cart management endpoints

import { body, param } from 'express-validator';

export const addToCartValidators = [
  body('productId')
    .trim()
    .notEmpty().withMessage('Məhsul ID-si tələb olunur'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Miqdar ən azı 1 olmalıdır'),
];

export const updateCartItemValidators = [
  param('productId')
    .notEmpty().withMessage('Məhsul ID-si tələb olunur'),
  
  body('quantity')
    .notEmpty().withMessage('Miqdar tələb olunur')
    .isInt({ min: 1 }).withMessage('Miqdar ən azı 1 olmalıdır'),
];

export const deleteCartItemValidators = [
  param('productId')
    .notEmpty().withMessage('Məhsul ID-si tələb olunur'),
];
