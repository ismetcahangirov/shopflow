// src/controllers/settingsController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

const PUBLIC_KEYS = ['site_name', 'site_email', 'currency', 'currency_symbol', 'shipping_cost', 'free_shipping_min', 'tax_rate'];

export const getSettings = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const settings = await prisma.setting.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  });

  successResponse(res, {
    message: 'Parametrlər',
    data: Object.fromEntries(settings.map((s) => [s.key, s.value])),
  });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { settings } = req.body as { settings: { key: string; value: string }[] };

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  logger.info(`Settings updated: ${settings.map((s) => s.key).join(', ')}`);
  successResponse(res, { message: 'Parametrlər yeniləndi' });
});
