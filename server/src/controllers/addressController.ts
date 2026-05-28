// src/controllers/addressController.ts
// Address Controller — GET (list), POST (create), PUT (update), DELETE (delete), PATCH (set default)

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { successResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

interface AddressInput {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  building?: string;
  apartment?: string;
  zip?: string;
  isDefault?: boolean;
}

// ── GET /api/addresses ─────────────────────────────────────
export const getAddresses = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    successResponse(res, {
      message: 'Ünvanlar uğurla gətirildi',
      data: addresses,
    });
  },
);

// ── POST /api/addresses ────────────────────────────────────
export const createAddress = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');

    const { fullName, phone, city, district, street, building, apartment, zip, isDefault } =
      req.body as AddressInput;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        fullName,
        phone,
        city,
        district,
        street,
        building: building ?? null,
        apartment: apartment ?? null,
        zip: zip ?? null,
        isDefault: isDefault ?? false,
        userId,
      },
    });

    logger.info(`Address ${address.id} created for user ${userId}`);

    successResponse(res, {
      statusCode: 201,
      message: 'Ünvan uğurla yaradıldı',
      data: address,
    });
  },
);

// ── PUT /api/addresses/:id ─────────────────────────────────
export const updateAddress = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const addressId = req.params.id as string;

    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      throw new AppError('Ünvan tapılmadı', 404, 'NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw new AppError('Bu ünvana giriş icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    const { fullName, phone, city, district, street, building, apartment, zip, isDefault } =
      req.body as AddressInput;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(district !== undefined && { district }),
        ...(street !== undefined && { street }),
        ...(building !== undefined && { building }),
        ...(apartment !== undefined && { apartment }),
        ...(zip !== undefined && { zip }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    logger.info(`Address ${addressId} updated for user ${userId}`);

    successResponse(res, {
      message: 'Ünvan uğurla yeniləndi',
      data: address,
    });
  },
);

// ── DELETE /api/addresses/:id ──────────────────────────────
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const addressId = req.params.id as string;

    const existing = await prisma.address.findUnique({
      where: { id: addressId },
      include: { orders: { select: { id: true }, take: 1 } },
    });

    if (!existing) {
      throw new AppError('Ünvan tapılmadı', 404, 'NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw new AppError('Bu ünvana giriş icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    if (existing.orders.length > 0) {
      throw new AppError(
        'Bu ünvan sifarişlə əlaqəli olduğu üçün silinə bilməz',
        409,
        'ADDRESS_HAS_ORDERS',
      );
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    logger.info(`Address ${addressId} deleted for user ${userId}`);

    successResponse(res, {
      message: 'Ünvan uğurla silindi',
    });
  },
);

// ── PATCH /api/addresses/:id/default ───────────────────────
export const setDefaultAddress = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Autentifikasiya tələb olunur', 401, 'UNAUTHORIZED');
    const addressId = req.params.id as string;

    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing) {
      throw new AppError('Ünvan tapılmadı', 404, 'NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw new AppError('Bu ünvana giriş icazəniz yoxdur', 403, 'FORBIDDEN');
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    logger.info(`Address ${addressId} set as default for user ${userId}`);

    successResponse(res, {
      message: 'Ünvan default olaraq təyin edildi',
    });
  },
);
