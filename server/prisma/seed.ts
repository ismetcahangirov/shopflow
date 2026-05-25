// prisma/seed.ts
// Seed data for development — admin, vendor, customer, categories, products, coupon

import { PrismaClient, Role, CouponType, VendorStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main(): Promise<void> {
  console.log('🌱 Seed data əlavə edilir...');

  // ── Admin user ─────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopflow.az' },
    update: {},
    create: {
      name: 'ShopFlow Admin',
      email: 'admin@shopflow.az',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('✅ Admin yaradıldı:', admin.email);

  // ── Test customer ──────────────────────────────────────
  const customerPassword = await bcrypt.hash('Customer@1234', SALT_ROUNDS);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.az' },
    update: {},
    create: {
      name: 'Test Müştəri',
      email: 'customer@test.az',
      password: customerPassword,
      role: Role.CUSTOMER,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('✅ Customer yaradıldı:', customer.email);

  // ── Test vendor ────────────────────────────────────────
  const vendorPassword = await bcrypt.hash('Vendor@1234', SALT_ROUNDS);
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@test.az' },
    update: {},
    create: {
      name: 'Test Vendor',
      email: 'vendor@test.az',
      password: vendorPassword,
      role: Role.VENDOR,
      isActive: true,
      isVerified: true,
      vendor: {
        create: {
          storeName: 'Tech Mağazası',
          slug: 'tech-magazasi',
          description: 'Ən yeni texnologiya məhsulları',
          status: VendorStatus.APPROVED,
          commission: 10.0,
        },
      },
    },
    include: { vendor: true },
  });
  console.log('✅ Vendor yaradıldı:', vendorUser.email);

  // ── Categories ─────────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where: { slug: 'elektronika' },
    update: {},
    create: {
      name: 'Elektronika',
      slug: 'elektronika',
      sortOrder: 1,
      isActive: true,
    },
  });

  const phones = await prisma.category.upsert({
    where: { slug: 'telefonlar' },
    update: {},
    create: {
      name: 'Telefonlar',
      slug: 'telefonlar',
      parentId: electronics.id,
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'geyim' },
    update: {},
    create: {
      name: 'Geyim',
      slug: 'geyim',
      sortOrder: 2,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'ev-ve-bag' },
    update: {},
    create: {
      name: 'Ev və Bağ',
      slug: 'ev-ve-bag',
      sortOrder: 3,
      isActive: true,
    },
  });

  console.log('✅ Kateqoriyalar yaradıldı');

  // ── Products ───────────────────────────────────────────
  const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUser.id } });
  if (!vendor) throw new Error('Vendor tapılmadı');

  await prisma.product.upsert({
    where: { slug: 'iphone-15-pro-256gb' },
    update: {},
    create: {
      name: 'iPhone 15 Pro 256GB',
      slug: 'iphone-15-pro-256gb',
      description: 'Apple iPhone 15 Pro 256GB Natural Titanium. A17 Pro çip, 48MP kamera sistemi.',
      shortDesc: 'Apple A17 Pro çip, 48MP kamera, Titanium dizayn',
      price: 2499.99,
      comparePrice: 2799.99,
      sku: 'IPH15PRO-256-TI',
      stock: 50,
      brand: 'Apple',
      isFeatured: true,
      tags: ['telefon', 'apple', 'iphone', '5g'],
      categoryId: phones.id,
      vendorId: vendor.id,
      images: {
        create: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            alt: 'iPhone 15 Pro öndan görünüş',
            isMain: true,
            sortOrder: 0,
          },
        ],
      },
      attributes: {
        create: [
          { name: 'Rəng', value: 'Natural Titanium' },
          { name: 'Yaddaş', value: '256GB' },
          { name: 'RAM', value: '8GB' },
          { name: 'Ekran', value: '6.1 düym Super Retina XDR' },
          { name: 'Batareya', value: '3274 mAh' },
          { name: 'OS', value: 'iOS 17' },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s24-ultra' },
    update: {},
    create: {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Samsung Galaxy S24 Ultra 256GB Titanium Gray. Snapdragon 8 Gen 3, 200MP kamera.',
      shortDesc: 'Snapdragon 8 Gen 3, 200MP kamera, S Pen daxil',
      price: 2199.99,
      comparePrice: 2499.99,
      sku: 'SAMS24U-256-TG',
      stock: 30,
      brand: 'Samsung',
      isFeatured: true,
      tags: ['telefon', 'samsung', 'galaxy', '5g', 's-pen'],
      categoryId: phones.id,
      vendorId: vendor.id,
      images: {
        create: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            alt: 'Samsung Galaxy S24 Ultra',
            isMain: true,
            sortOrder: 0,
          },
        ],
      },
      attributes: {
        create: [
          { name: 'Rəng', value: 'Titanium Gray' },
          { name: 'Yaddaş', value: '256GB' },
          { name: 'RAM', value: '12GB' },
          { name: 'Ekran', value: '6.8 düym Dynamic AMOLED 2X' },
          { name: 'Batareya', value: '5000 mAh' },
          { name: 'OS', value: 'Android 14' },
        ],
      },
    },
  });

  console.log('✅ Məhsullar yaradıldı');

  // ── Coupon ─────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      type: CouponType.PERCENTAGE,
      value: 20,
      minOrderValue: 100,
      maxDiscount: 200,
      maxUses: 1000,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE50' },
    update: {},
    create: {
      code: 'SAVE50',
      type: CouponType.FIXED_AMOUNT,
      value: 50,
      minOrderValue: 300,
      isActive: true,
    },
  });

  console.log('✅ Kuponlar yaradıldı');

  // ── Settings ───────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'ShopFlow', group: 'general' },
    { key: 'site_description', value: 'Azərbaycanın ən böyük e-ticarət platforması', group: 'general' },
    { key: 'currency', value: 'AZN', group: 'general' },
    { key: 'currency_symbol', value: '₼', group: 'general' },
    { key: 'shipping_cost', value: '5', group: 'shipping' },
    { key: 'free_shipping_threshold', value: '100', group: 'shipping' },
    { key: 'contact_email', value: 'info@shopflow.az', group: 'general' },
    { key: 'contact_phone', value: '+994 50 000 00 00', group: 'general' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Parametrlər yaradıldı');
  console.log('🎉 Seed tamamlandı!');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed xətası:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
