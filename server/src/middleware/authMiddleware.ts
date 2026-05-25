// src/middleware/authMiddleware.ts
// Verifies JWT access token from Authorization header — attaches user to req

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/generateToken';
import { AppError } from '../utils/AppError';

export function protect(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('İcazə yoxdur. Token təqdim edin', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('İcazə yoxdur. Token tapılmadı', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as 'ADMIN' | 'VENDOR' | 'CUSTOMER',
    };
    next();
  } catch {
    next(new AppError('Token etibarsızdır və ya müddəti bitib', 401, 'INVALID_TOKEN'));
  }
}
