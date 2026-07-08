import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { successResponse } from '../utils/apiResponse';

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

describe('successResponse', () => {
  it('converts Prisma.Decimal fields in data to plain numbers', () => {
    const res = mockRes();

    successResponse(res, {
      message: 'ok',
      data: { product: { price: new Prisma.Decimal('2199.99'), name: 'Phone' } },
    });

    expect(res.body).toEqual({
      success: true,
      message: 'ok',
      data: { product: { price: 2199.99, name: 'Phone' } },
    });
    const price = (res.body as { data: { product: { price: unknown } } }).data.product.price;
    expect(typeof price).toBe('number');
  });

  it('converts Decimals inside arrays (e.g. product lists)', () => {
    const res = mockRes();

    successResponse(res, {
      message: 'ok',
      data: { products: [{ price: new Prisma.Decimal('10.50') }, { price: new Prisma.Decimal('5.00') }] },
    });

    expect(res.body).toEqual({
      success: true,
      message: 'ok',
      data: { products: [{ price: 10.5 }, { price: 5 }] },
    });
  });
});
