import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { assertSafeTestEnvironment } from './helpers/testDatabase';

export default async function globalSetup(): Promise<void> {
  assertSafeTestEnvironment();

  // Reset database once before all test files run.
  // Each test file is responsible for creating and cleaning its own data.
  const prisma = new PrismaClient();
  try {
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
  } finally {
    await prisma.$disconnect();
  }
}
