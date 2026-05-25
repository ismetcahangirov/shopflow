// src/middleware/validateRequest.ts
// express-validator based request validation middleware

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg as string,
    }));

    errorResponse(res, 400, 'Daxil edilən məlumat yanlışdır', 'VALIDATION_ERROR', details);
    return;
  }

  next();
}
