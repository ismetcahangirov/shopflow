// src/tests/trustProxy.test.ts
// Guards the Express `trust proxy` configuration: it must be enabled (exactly one
// hop) when running behind Vercel's proxy so express-rate-limit can read the real
// client IP without throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR — and must stay at
// Express's safe default (false) everywhere else, so a client cannot spoof
// X-Forwarded-For to evade rate limiting.

import type { Express } from 'express';

function loadApp(): Express {
  let app: Express | undefined;
  jest.isolateModules(() => {
    // Reload server.ts fresh so it re-reads process.env.VERCEL at import time.
    // require (not import) is what jest.isolateModules can capture synchronously.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    app = (require('../server') as { app: Express }).app;
  });
  if (!app) {
    throw new Error('Failed to load Express app from ../server');
  }
  return app;
}

describe('trust proxy configuration', () => {
  const originalVercel = process.env.VERCEL;

  afterEach(() => {
    if (originalVercel === undefined) {
      delete process.env.VERCEL;
    } else {
      process.env.VERCEL = originalVercel;
    }
    jest.resetModules();
  });

  it('trusts one proxy hop when running on Vercel', () => {
    process.env.VERCEL = '1';
    expect(loadApp().get('trust proxy')).toBe(1);
  });

  it('leaves trust proxy at the safe default off Vercel', () => {
    delete process.env.VERCEL;
    expect(loadApp().get('trust proxy')).toBe(false);
  });
});
