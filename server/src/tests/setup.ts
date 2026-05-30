import { prisma } from '../config/db';
import { assertSafeTestEnvironment, resetTestDatabase } from './helpers/testDatabase';

beforeAll(async () => {
  assertSafeTestEnvironment();
  await resetTestDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

