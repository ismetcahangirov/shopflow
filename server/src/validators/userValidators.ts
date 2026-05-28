// src/validators/userValidators.ts
import { body, param } from 'express-validator';

export const updateProfileValidators = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Ad 2-100 simvol olmalıdır'),
  body('email').optional().trim().isEmail().withMessage('Düzgün email daxil edin'),
];

export const updatePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Cari şifrə tələb olunur'),
  body('newPassword').isLength({ min: 8 }).withMessage('Yeni şifrə ən azı 8 simvol olmalıdır'),
  body('confirmPassword').notEmpty().withMessage('Şifrə təsdiqi tələb olunur'),
];

export const toggleStatusValidators = [
  param('id').notEmpty().withMessage('İstifadəçi ID-si tələb olunur'),
  body('isActive').isBoolean().withMessage('isActive boolean olmalıdır'),
];
