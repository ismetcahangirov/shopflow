// src/validators/orderValidators.ts
// express-validator rules for Order management endpoints

import { body, param, query } from 'express-validator';

export const createOrderValidators = [
  body('addressId')
    .trim()
    .notEmpty().withMessage('Ünvan ID-si tələb olunur'),

  body('couponCode')
    .optional()
    .trim(),

  body('notes')
    .optional()
    .trim(),
];

export const orderIdParamValidator = [
  param('id')
    .notEmpty().withMessage('Sifariş ID-si tələb olunur'),
];

export const updateOrderStatusValidators = [
  param('id')
    .notEmpty().withMessage('Sifariş ID-si tələb olunur'),

  body('status')
    .trim()
    .notEmpty().withMessage('Status tələb olunur')
    .isIn(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .withMessage('Yanlış status'),

  body('trackingNumber')
    .optional()
    .trim(),

  body('note')
    .optional()
    .trim(),
];

export const cancelOrderValidators = [
  param('id')
    .notEmpty().withMessage('Sifariş ID-si tələb olunur'),

  body('reason')
    .optional()
    .trim(),
];

export const getOrdersQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Səhifə ən azı 1 olmalıdır'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),
];
