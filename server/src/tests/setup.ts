import { assertSafeTestEnvironment } from './helpers/testDatabase';

// This file runs before EACH test file (setupFilesAfterEnv).
// We only validate the environment here — DB reset is done in globalSetup.ts
// to avoid wiping data created by a previous test file's beforeAll.
beforeAll(async () => {
  assertSafeTestEnvironment();
});
