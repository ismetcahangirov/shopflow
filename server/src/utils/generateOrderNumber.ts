// src/utils/generateOrderNumber.ts
// Generates unique order number: ORD-YYYYMMDD-XXXXXX

import { prisma } from '../config/db';

export async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

  const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `ORD-${dateStr}-${sequence}`;
}
