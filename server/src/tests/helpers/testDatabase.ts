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

  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();
}
