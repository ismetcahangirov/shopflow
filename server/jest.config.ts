import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/types/**',
    '!src/tests/**',
    '!src/prisma/**',
    '!src/config/**',
    '!src/utils/seed.ts',
    '!src/controllers/paymentController.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 65,
      lines: 77,
      statements: 74,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  globalSetup: '<rootDir>/src/tests/globalSetup.ts',
  clearMocks: true,
  restoreMocks: true,
};

export default config;
