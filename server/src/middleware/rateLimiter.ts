// src/middleware/rateLimiter.ts
// Rate limiting configurations for different endpoint types

import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/apiResponse';

// General API limiter — 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    errorResponse(res, 429, 'Çox sayda sorğu göndərdiniz. Bir az gözləyin.', 'RATE_LIMIT_EXCEEDED');
  },
});

// Strict auth limiter — 10 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    errorResponse(
      res,
      429,
      'Çox sayda giriş cəhdi. 15 dəqiqə sonra yenidən cəhd edin.',
      'AUTH_RATE_LIMIT_EXCEEDED'
    );
  },
});

// Password reset limiter — 5 requests per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    errorResponse(
      res,
      429,
      'Çox sayda şifrə sıfırlama cəhdi. 1 saat sonra yenidən cəhd edin.',
      'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
    );
  },
});
