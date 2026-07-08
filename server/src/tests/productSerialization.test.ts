// Regression test for issue #68:
// Product endpoints returned Prisma.Decimal price fields serialized as JSON
// strings, crashing the client (`price.toFixed is not a function`). The
// response must expose numeric price fields. Prisma is fully mocked so this
// runs without a database.

import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

jest.mock('../config/db', () => ({
  prisma: { product: { findMany: jest.fn() } },
}));

import { prisma } from '../config/db';
import { getFeaturedProducts } from '../controllers/productController';

const flush = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

function mockRes(): Response & { body?: unknown; code?: number } {
  const res = {} as Response & { body?: unknown; code?: number };
  res.status = ((code: number) => {
    res.code = code;
    return res;
  }) as Response['status'];
  res.json = ((body: unknown) => {
    res.body = body;
    return res;
  }) as Response['json'];
  return res;
}

describe('getFeaturedProducts (issue #68)', () => {
  it('returns price and comparePrice as numbers, not Decimal strings', async () => {
    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'p1',
        name: 'Phone',
        slug: 'phone',
        price: new Prisma.Decimal('2199.99'),
        comparePrice: new Prisma.Decimal('2499.99'),
        avgRating: 4.5,
        images: [],
      },
    ]);

    const res = mockRes();
    getFeaturedProducts({} as Request, res, (() => undefined) as NextFunction);
    await flush();

    const product = (res.body as { data: { products: Array<Record<string, unknown>> } }).data
      .products[0];

    expect(typeof product.price).toBe('number');
    expect(product.price).toBe(2199.99);
    expect(typeof product.comparePrice).toBe('number');
    expect(product.comparePrice).toBe(2499.99);
  });
});
