// src/tests/trustProxy.test.ts
// Guards the Express `trust proxy` configuration: it must be enabled (exactly one
// hop) when running behind Vercel's proxy so express-rate-limit can read the real
// client IP without throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR — and must stay at
// Express's safe default (false) everywhere else, so a client cannot spoof
// X-Forwarded-For to evade rate limiting.

import type { Express } from 'express';

function loadApp(): Express {
  let app: Express;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    app = require('../server').app as Express;
  });
  return app!;
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
