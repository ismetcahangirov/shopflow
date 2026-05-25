// src/tests/helpers/testHelpers.ts
// Shared helpers for auth integration tests

import { prisma } from '../../config/db';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '../../utils/generateToken';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
  password: string;
}

export async function createTestUser(overrides: Partial<{
  email: string;
  name: string;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
  password: string;
  isVerified: boolean;
  isActive: boolean;
}> = {}): Promise<TestUser> {
  const raw = overrides.password ?? 'TestPass123!';
  const hashed = await bcrypt.hash(raw, 10);

  const user = await prisma.user.create({
    data: {
      email: overrides.email ?? `test-${Date.now()}@example.com`,
      name: overrides.name ?? 'Test User',
      password: hashed,
      role: overrides.role ?? 'CUSTOMER',
      isVerified: overrides.isVerified ?? true,
      isActive: overrides.isActive ?? true,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return { ...user, password: raw, role: user.role as 'ADMIN' | 'VENDOR' | 'CUSTOMER' };
}

export function getBearerToken(user: TestUser): string {
  const token = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  return `Bearer ${token}`;
}

export async function cleanupUsers(...emails: string[]): Promise<void> {
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
}
