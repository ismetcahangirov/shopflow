// src/tests/cookieOptions.test.ts
// Pure unit tests for the refresh-token cookie attribute resolver (issue #90).
// No DB, no env — safe to run standalone.

import {
  resolveSameSite,
  resolveRefreshCookieOptions,
  resolveClearRefreshCookieOptions,
} from '../utils/cookieOptions';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

describe('resolveSameSite', () => {
  it('defaults to none in production (cross-site *.vercel.app)', () => {
    expect(resolveSameSite({ nodeEnv: 'production' })).toBe('none');
  });

  it('defaults to lax outside production (same-site local dev)', () => {
    expect(resolveSameSite({ nodeEnv: 'development' })).toBe('lax');
    expect(resolveSameSite({ nodeEnv: 'test' })).toBe('lax');
  });

  it('honors an explicit override in any environment', () => {
    expect(resolveSameSite({ nodeEnv: 'production', sameSite: 'lax' })).toBe('lax');
    expect(resolveSameSite({ nodeEnv: 'production', sameSite: 'strict' })).toBe('strict');
    expect(resolveSameSite({ nodeEnv: 'development', sameSite: 'none' })).toBe('none');
  });
});

describe('resolveRefreshCookieOptions', () => {
  it('production: SameSite=None + Secure so the cross-site cookie is sent', () => {
    const opts = resolveRefreshCookieOptions({ nodeEnv: 'production' });
    expect(opts).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: SEVEN_DAYS_MS,
      path: '/',
    });
  });

  it('development: SameSite=Lax, not Secure (works over http://localhost)', () => {
    const opts = resolveRefreshCookieOptions({ nodeEnv: 'development' });
    expect(opts.sameSite).toBe('lax');
    expect(opts.secure).toBe(false);
    expect(opts.httpOnly).toBe(true);
  });

  it('forces Secure whenever SameSite=None, even outside production', () => {
    const opts = resolveRefreshCookieOptions({ nodeEnv: 'development', sameSite: 'none' });
    expect(opts.sameSite).toBe('none');
    expect(opts.secure).toBe(true);
  });

  it('keeps Secure in production even when overridden to a same-site mode', () => {
    const opts = resolveRefreshCookieOptions({ nodeEnv: 'production', sameSite: 'lax' });
    expect(opts.sameSite).toBe('lax');
    expect(opts.secure).toBe(true);
  });
});

describe('resolveClearRefreshCookieOptions', () => {
  it('mirrors the set options minus maxAge so the browser removes the cookie', () => {
    const clear = resolveClearRefreshCookieOptions({ nodeEnv: 'production' });
    expect(clear).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    expect('maxAge' in clear).toBe(false);
  });
});
