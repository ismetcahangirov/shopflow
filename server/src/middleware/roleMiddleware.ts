// src/middleware/roleMiddleware.ts
// Role-based authorization — restricts access to specific user roles

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

type Role = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('İstifadəçi məlumatı tapılmadı', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Bu əməliyyat üçün "${roles.join(' və ya ')}" rolu tələb olunur`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}
