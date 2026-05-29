import { prisma } from '../config/db';
import { assertSafeTestEnvironment } from './helpers/testDatabase';

beforeAll(() => {
  assertSafeTestEnvironment();
});

afterAll(async () => {
  await prisma.$disconnect();
});
