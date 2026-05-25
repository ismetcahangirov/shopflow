// src/utils/apiResponse.ts
// Standardized API response helpers — ensures consistent response shape

import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SuccessResponseOptions {
  message: string;
  data?: unknown;
  pagination?: PaginationMeta;
  statusCode?: number;
}

interface ValidationErrorDetail {
  field: string;
  message: string;
}

export function successResponse(
  res: Response,
  options: SuccessResponseOptions
): Response {
  const { message, data, pagination, statusCode = 200 } = options;

  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  });
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  errorCode: string,
  details?: ValidationErrorDetail[]
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    statusCode,
    ...(details && details.length > 0 && { details }),
  });
}
