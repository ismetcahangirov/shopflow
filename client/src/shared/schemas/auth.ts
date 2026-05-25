// src/shared/schemas/auth.ts
// Reusable, highly localized authentication Zod validation schemas

import { z } from 'zod';

// Phone number regex validating Azerbaijani format e.g. +994 50 123 45 67 (optional spaces/hyphens)
const azPhoneRegex = /^\+994\s?(50|51|55|70|77|99|10)\s?\d{3}\s?\d{2}\s?\d{2}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'email_required' })
    .email({ message: 'email_invalid' }),
  password: z
    .string()
    .min(1, { message: 'password_required' }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'name_required' })
      .max(100),
    email: z
      .string()
      .min(1, { message: 'email_required' })
      .email({ message: 'email_invalid' }),
    password: z
      .string()
      .min(8, { message: 'password_min_length' })
      .max(100),
    confirmPassword: z
      .string()
      .min(1, { message: 'password_required' }),
    role: z
      .enum(['CUSTOMER', 'VENDOR'], {
        message: 'role_invalid',
      }),
    storeName: z
      .string()
      .max(100)
      .optional(),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || azPhoneRegex.test(val.replace(/\s+/g, '')),
        { message: 'phone_invalid' }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'password_mismatch',
    path: ['confirmPassword'],
  })
  .refine((data) => data.role !== 'VENDOR' || (!!data.storeName && data.storeName.trim().length > 0), {
    message: 'store_name_required',
    path: ['storeName'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'email_required' })
    .email({ message: 'email_invalid' }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'password_min_length' })
      .max(100),
    confirmPassword: z
      .string()
      .min(1, { message: 'password_required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'password_mismatch',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
