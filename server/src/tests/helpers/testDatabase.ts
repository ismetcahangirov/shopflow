import { prisma } from '../../config/db';

const PRODUCTION_DATABASE_HINTS = [
  'production',
  'prod',
  'shopflow-prod',
  'api.shopflow.az',
];

export function assertSafeTestEnvironment(databaseUrl = process.env.DATABASE_URL): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Backend tests must run with NODE_ENV=test.');
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for backend tests.');
  }

  const normalizedDatabaseUrl = databaseUrl.toLowerCase();
  const hasProductionHint = PRODUCTION_DATABASE_HINTS.some((hint) =>
    normalizedDatabaseUrl.includes(hint)
  );

  if (hasProductionHint) {
    throw new Error('Refusing to run tests against a production-like DATABASE_URL.');
  }
}

export async function resetTestDatabase(): Promise<void> {
  assertSafeTestEnvironment();

  await prisma.$transaction([
    prisma.orderStatusHistory.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.review.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productAttribute.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.address.deleteMany(),
    prisma.vendor.deleteMany(),
    prisma.user.deleteMany(),
    prisma.setting.deleteMany(),
  ]);
}
