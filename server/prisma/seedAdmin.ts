// prisma/seedAdmin.ts
// Idempotent admin seed driven entirely by environment variables so no
// credentials are ever committed. Set ADMIN_EMAIL + ADMIN_PASSWORD (and
// optionally ADMIN_NAME) in server/.env (gitignored), then run:
//   npm run prisma:seed:admin
// Re-running updates the password/role for the same email (safe to repeat).

import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'ShopFlow Admin';

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set (add them to server/.env — do not commit).',
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: Role.ADMIN, isActive: true, isVerified: true },
    create: {
      name,
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  console.log(`✅ Admin ready: ${admin.email} (role=${admin.role})`);
}

main()
  .catch((error) => {
    console.error('❌ Admin seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
