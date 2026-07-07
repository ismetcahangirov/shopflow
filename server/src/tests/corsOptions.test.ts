// src/tests/corsOptions.test.ts
// Unit tests for the CORS origin whitelist (issue #59 — production frontend
// was blocked because its Vercel domain was missing from the whitelist).

import 'dotenv/config';
import type { CorsOptions } from 'cors';
import { isOriginAllowed, allowedOrigins, corsOptions } from '../config/corsOptions';

type OriginFn = Extract<CorsOptions['origin'], (...args: never[]) => unknown>;

// Invoke the cors `origin` callback and capture what it reports. Our origin
// function calls the callback synchronously, so this returns directly.
function callOrigin(origin: string | undefined): { error: Error | null; allow: unknown } {
  let captured: { error: Error | null; allow: unknown } = { error: null, allow: undefined };
  (corsOptions.origin as OriginFn)(origin, (error: Error | null, allow?: unknown) => {
    captured = { error, allow };
  });
  return captured;
}

describe('isOriginAllowed', () => {
  it('allows the production Vercel frontend domain (issue #59)', () => {
    expect(isOriginAllowed('https://shopflow-theta.vercel.app')).toBe(true);
  });

  it('allows the primary and www custom domains', () => {
    expect(isOriginAllowed('https://shopflow.az')).toBe(true);
    expect(isOriginAllowed('https://www.shopflow.az')).toBe(true);
  });

  it('allows the configured CLIENT_URL', () => {
    expect(allowedOrigins).toContain(process.env.CLIENT_URL);
    expect(isOriginAllowed(process.env.CLIENT_URL as string)).toBe(true);
  });

  it('rejects an unknown origin', () => {
    expect(isOriginAllowed('https://evil.example.com')).toBe(false);
  });

  it('does not allow arbitrary *.vercel.app apps by default', () => {
    expect(isOriginAllowed('https://totally-unrelated.vercel.app')).toBe(false);
  });
});

describe('corsOptions.origin callback', () => {
  it('allows requests with no origin (curl, SSR, mobile)', () => {
    const { error, allow } = callOrigin(undefined);
    expect(error).toBeNull();
    expect(allow).toBe(true);
  });

  it('allows a whitelisted origin', () => {
    const { error, allow } = callOrigin('https://shopflow-theta.vercel.app');
    expect(error).toBeNull();
    expect(allow).toBe(true);
  });

  it('rejects a non-whitelisted origin with an error', () => {
    const { error } = callOrigin('https://evil.example.com');
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toMatch(/not allowed/);
  });
});

describe('corsOptions settings', () => {
  it('sends credentials and caches preflight', () => {
    expect(corsOptions.credentials).toBe(true);
    expect(corsOptions.methods).toContain('OPTIONS');
    expect(corsOptions.maxAge).toBe(86400);
  });
});

// Re-import corsOptions with a temporarily patched env so the module re-reads
// config at load time. Restores env and the module registry afterwards.
async function withEnv(
  patch: Record<string, string | undefined>,
): Promise<typeof import('../config/corsOptions')> {
  const previous: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(patch)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  jest.resetModules();
  try {
    return await import('../config/corsOptions');
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    jest.resetModules();
  }
}

describe('CORS_EXTRA_ORIGINS env override', () => {
  it('whitelists comma-separated origins from the env var', async () => {
    const mod = await withEnv({
      CORS_EXTRA_ORIGINS: 'https://staging.shopflow.az, https://foo.example.com',
    });
    expect(mod.isOriginAllowed('https://staging.shopflow.az')).toBe(true);
    expect(mod.isOriginAllowed('https://foo.example.com')).toBe(true);
    expect(mod.isOriginAllowed('https://bar.example.com')).toBe(false);
  });
});

describe('CORS_ALLOW_VERCEL_PREVIEWS env flag', () => {
  it('allows shopflow-* preview domains only when enabled', async () => {
    const mod = await withEnv({ CORS_ALLOW_VERCEL_PREVIEWS: 'true' });
    expect(mod.isOriginAllowed('https://shopflow-git-main-team.vercel.app')).toBe(true);
    // still scoped to the shopflow- prefix, not any vercel app
    expect(mod.isOriginAllowed('https://unrelated-app.vercel.app')).toBe(false);
  });
});
