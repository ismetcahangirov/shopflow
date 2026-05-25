// src/middleware/errorMiddleware.ts
// Global error handler — catches all errors thrown or passed to next()

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { config } from '../config/env';

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known operational errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Operational error', {
        message: err.message,
        errorCode: err.errorCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    }

    errorResponse(res, err.statusCode, err.message, err.errorCode);
    return;
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn('Prisma error', { code: err.code, meta: err.meta });

    if (err.code === 'P2002') {
      errorResponse(res, 409, 'Bu dəyər artıq mövcuddur', 'DUPLICATE_ENTRY');
      return;
    }
    if (err.code === 'P2025') {
      errorResponse(res, 404, 'Qeyd tapılmadı', 'NOT_FOUND');
      return;
    }
    if (err.code === 'P2003') {
      errorResponse(res, 400, 'Əlaqəli qeyd tapılmadı', 'FOREIGN_KEY_ERROR');
      return;
    }

    errorResponse(res, 400, 'Verilənlər bazası xətası', 'DATABASE_ERROR');
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    errorResponse(res, 400, 'Daxil edilən məlumat yanlışdır', 'VALIDATION_ERROR', details);
    return;
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    errorResponse(res, 401, 'Token müddəti bitib', 'TOKEN_EXPIRED');
    return;
  }
  if (err instanceof JsonWebTokenError) {
    errorResponse(res, 401, 'Token etibarsızdır', 'INVALID_TOKEN');
    return;
  }

  // Unknown errors — log full details, hide from client in production
  const message =
    err instanceof Error ? err.message : 'Gözlənilməz xəta baş verdi';
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error('Unhandled error', {
    message,
    stack,
    path: req.path,
    method: req.method,
    body: req.body as unknown,
  });

  const responseMessage =
    config.NODE_ENV === 'production' ? 'Daxili server xətası' : message;

  errorResponse(res, 500, responseMessage, 'INTERNAL_ERROR');
}
