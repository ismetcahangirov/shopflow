// src/validators/couponValidators.ts
// express-validator rules for Coupon management endpoints

import { body, param } from 'express-validator';

export const createCouponValidators = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Kupon kodu tələb olunur')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Kupon kodu yalnız hərf, rəqəm, tire və alt cizgidən ibarət olmalıdır')
    .isLength({ min: 3, max: 30 })
    .withMessage('Kupon kodu 3-30 simvol olmalıdır'),

  body('type')
    .trim()
    .notEmpty()
    .withMessage('Kupon növü tələb olunur')
    .isIn(['PERCENTAGE', 'FIXED_AMOUNT'])
    .withMessage('Kupon növü yalnız PERCENTAGE və ya FIXED_AMOUNT ola bilər'),

  body('value')
    .notEmpty()
    .withMessage('Kupon dəyəri tələb olunur')
    .isFloat({ min: 0.01 })
    .withMessage('Kupon dəyəri müsbət ədəd olmalıdır')
    .custom((value, { req }) => {
      if (req.body.type === 'PERCENTAGE' && Number(value) > 100) {
        throw new Error('Faiz kuponu üçün dəyər 100-dən çox ola bilməz');
      }
      return true;
    }),

  body('minOrderValue')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Minimum sifariş məbləği müsbət ədəd olmalıdır'),

  body('maxDiscount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Maksimum endirim məbləği müsbət ədəd olmalıdır'),

  body('maxUses')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Maksimum istifadə sayı ən azı 1 olmalıdır'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive boolean olmalıdır'),

  body('startsAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Başlanğıc tarixi etibarlı tarix olmalıdır'),

  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Bitmə tarixi etibarlı tarix olmalıdır')
    .custom((value, { req }) => {
      if (value && req.body.startsAt && new Date(value) <= new Date(req.body.startsAt)) {
        throw new Error('Bitmə tarixi başlanğıc tarixindən sonra olmalıdır');
      }
      return true;
    }),
];

export const updateCouponValidators = [
  param('id')
    .notEmpty()
    .withMessage('Kupon ID-si tələb olunur'),

  body('code')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Kupon kodu yalnız hərf, rəqəm, tire və alt cizgidən ibarət olmalıdır')
    .isLength({ min: 3, max: 30 })
    .withMessage('Kupon kodu 3-30 simvol olmalıdır'),

  body('type')
    .optional()
    .trim()
    .isIn(['PERCENTAGE', 'FIXED_AMOUNT'])
    .withMessage('Kupon növü yalnız PERCENTAGE və ya FIXED_AMOUNT ola bilər'),

  body('value')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Kupon dəyəri müsbət ədəd olmalıdır')
    .custom((value, { req }) => {
      const type = req.body.type;
      if (type === 'PERCENTAGE' && Number(value) > 100) {
        throw new Error('Faiz kuponu üçün dəyər 100-dən çox ola bilməz');
      }
      return true;
    }),

  body('minOrderValue')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Minimum sifariş məbləği müsbət ədəd olmalıdır'),

  body('maxDiscount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Maksimum endirim məbləği müsbət ədəd olmalıdır'),

  body('maxUses')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Maksimum istifadə sayı ən azı 1 olmalıdır'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive boolean olmalıdır'),

  body('startsAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Başlanğıc tarixi etibarlı tarix olmalıdır'),

  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Bitmə tarixi etibarlı tarix olmalıdır')
    .custom((value, { req }) => {
      const startsAt = req.body.startsAt;
      if (value && startsAt && new Date(value) <= new Date(startsAt)) {
        throw new Error('Bitmə tarixi başlanğıc tarixindən sonra olmalıdır');
      }
      return true;
    }),
];

export const validateCouponValidators = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Kupon kodu tələb olunur'),

  body('subtotal')
    .notEmpty()
    .withMessage('Sifarişin subtotal dəyəri tələb olunur')
    .isFloat({ min: 0 })
    .withMessage('Subtotal dəyəri mənfi ola bilməz'),
];

export const couponIdParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Kupon ID-si tələb olunur'),
];
