import { Prisma } from '@prisma/client';
import { serializeDecimals } from '../utils/serializeDecimals';

describe('serializeDecimals', () => {
  it('converts a top-level Prisma.Decimal to a number', () => {
    const result = serializeDecimals(new Prisma.Decimal('2199.99'));

    expect(result).toBe(2199.99);
    expect(typeof result).toBe('number');
  });

  it('converts Decimal fields nested in an object', () => {
    const input = {
      price: new Prisma.Decimal('2199.99'),
      comparePrice: new Prisma.Decimal('2499.99'),
      name: 'Phone',
    };

    expect(serializeDecimals(input)).toEqual({
      price: 2199.99,
      comparePrice: 2499.99,
      name: 'Phone',
    });
  });

  it('converts Decimals nested inside arrays and deep structures', () => {
    const input = {
      products: [
        { price: new Prisma.Decimal('10.50'), variants: [{ price: new Prisma.Decimal('5.00') }] },
      ],
    };

    expect(serializeDecimals(input)).toEqual({
      products: [{ price: 10.5, variants: [{ price: 5 }] }],
    });
  });

  it('preserves non-Decimal values (numeric string, number, boolean, null, Date)', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const input = { sku: '12345', stock: 7, isActive: true, deletedAt: null, createdAt };

    const result = serializeDecimals(input) as Record<string, unknown>;

    expect(result.sku).toBe('12345'); // numeric string must NOT become a number
    expect(result.stock).toBe(7);
    expect(result.isActive).toBe(true);
    expect(result.deletedAt).toBeNull();
    expect(result.createdAt).toBe(createdAt); // Date preserved, not recursed into
  });

  it('passes through primitives and null unchanged', () => {
    expect(serializeDecimals(null)).toBeNull();
    expect(serializeDecimals('hello')).toBe('hello');
    expect(serializeDecimals(42)).toBe(42);
  });
});
