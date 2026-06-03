// src/validators/settingsValidators.ts
import { body } from 'express-validator';

export const updateSettingsValidators = [
  body('settings')
    .isArray({ min: 1 }).withMessage('Parametrlər siyahısı massiv olmalıdır'),
  body('settings.*.key')
    .trim()
    .notEmpty().withMessage('Parametr açarı tələb olunur')
    .isString().withMessage('Parametr açarı mətn olmalıdır'),
  body('settings.*.value')
    .trim()
    .notEmpty().withMessage('Parametr dəyəri tələb olunur')
    .isString().withMessage('Parametr dəyəri mətn olmalıdır'),
];
