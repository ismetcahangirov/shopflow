// src/validators/wishlistValidators.ts
import { body, param } from 'express-validator';

export const addToWishlistValidators = [
  body('productId')
    .trim()
    .notEmpty().withMessage('Məhsul ID-si tələb olunur'),
];

export const removeFromWishlistValidator = [
  param('productId')
    .notEmpty().withMessage('Məhsul ID-si tələb olunur'),
];
