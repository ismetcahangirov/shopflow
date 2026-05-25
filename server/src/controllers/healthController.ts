// src/controllers/healthController.ts
// Health check endpoint — verifies server and database connectivity

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { prisma } from '../config/db';

export const getHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  await prisma.$queryRaw`SELECT 1`;

  successResponse(res, {
    message: 'Server is healthy',
    data: {
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});
