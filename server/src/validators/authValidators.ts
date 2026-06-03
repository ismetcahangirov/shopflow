// src/validators/authValidators.ts
// express-validator chains for all auth endpoints

import { body, param } from 'express-validator';

export const registerValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Ad tələb olunur')
    .isLength({ min: 2, max: 100 }).withMessage('Ad 2-100 simvol arasında olmalıdır'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email tələb olunur')
    .isEmail().withMessage('Düzgün email daxil edin')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Şifrə tələb olunur')
    .isLength({ min: 8 }).withMessage('Şifrə minimum 8 simvol olmalıdır')
    .isLength({ max: 100 }).withMessage('Şifrə maksimum 100 simvol ola bilər'),

  body('role')
    .optional()
    .isIn(['CUSTOMER', 'VENDOR']).withMessage('Rol CUSTOMER və ya VENDOR olmalıdır'),

  body('storeName')
    .if(body('role').equals('VENDOR'))
    .trim()
    .notEmpty().withMessage('Vendor üçün mağaza adı tələb olunur')
    .isLength({ max: 100 }).withMessage('Mağaza adı maksimum 100 simvol ola bilər'),

  body('phone')
    .optional()
    .isMobilePhone('az-AZ').withMessage('Düzgün Azərbaycan nömrəsi daxil edin'),
];

export const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email tələb olunur')
    .isEmail().withMessage('Düzgün email daxil edin')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Şifrə tələb olunur'),
];

export const forgotPasswordValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email tələb olunur')
    .isEmail().withMessage('Düzgün email daxil edin')
    .normalizeEmail(),
];

export const resetPasswordValidators = [
  param('token').notEmpty().withMessage('Token tələb olunur'),
  body('password')
    .notEmpty().withMessage('Şifrə tələb olunur')
    .isLength({ min: 8 }).withMessage('Şifrə minimum 8 simvol olmalıdır')
    .isLength({ max: 100 }).withMessage('Şifrə maksimum 100 simvol ola bilər'),
];

export const googleAuthValidators = [
  body('idToken')
    .notEmpty().withMessage('Google ID token tələb olunur'),
];

export const verifyEmailValidators = [
  param('token').notEmpty().withMessage('Token tələb olunur'),
];
