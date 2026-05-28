// src/validators/paymentValidators.ts
// express-validator rules for Payment endpoints

import { body } from 'express-validator';

export const createPaymentIntentValidators = [
  body('orderId')
    .trim()
    .notEmpty().withMessage('Sifariş ID-si tələb olunur'),
];

export const createRefundValidators = [
  body('orderId')
    .trim()
    .notEmpty().withMessage('Sifariş ID-si tələb olunur'),

  body('reason')
    .optional()
    .trim(),
];
