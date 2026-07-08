// src/utils/serializeDecimals.ts
// Recursively converts Prisma.Decimal instances to plain JS numbers.
//
// Prisma serializes Decimal columns to JSON *strings* by default (via
// Decimal.toJSON), but clients type these fields as `number` and run numeric
// operations on them (e.g. `price.toFixed(2)`, price arithmetic). Normalizing
// at the API boundary keeps the response contract numeric. Values within
// Decimal(12,2) are well inside Number.MAX_SAFE_INTEGER, so precision is safe.

import { Prisma } from '@prisma/client';

export function serializeDecimals<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Prisma.Decimal.isDecimal(value)) {
    return value.toNumber() as unknown as T;
  }

  // Leave non-plain objects (Date, Buffer, …) untouched — don't recurse into them.
  if (value instanceof Date || Buffer.isBuffer(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeDecimals(item)) as unknown as T;
  }

  if (typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      output[key] = serializeDecimals(val);
    }
    return output as unknown as T;
  }

  return value;
}
