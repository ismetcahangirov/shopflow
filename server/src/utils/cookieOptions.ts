// src/utils/cookieOptions.ts
// Resolve the refresh-token cookie attributes from the environment.
//
// The live frontend (shopflow-theta.vercel.app) and API (api-shopflow.vercel.app)
// sit on different registrable domains — *.vercel.app is on the Public Suffix
// List, so every subdomain is its own site. That makes the refresh XHR
// cross-site, and a `SameSite=Strict`/`Lax` cookie is NEVER attached to a
// cross-site request. The server then sees no refresh token and every hard
// reload / new tab logs the user out (issue #90).
//
// Defaulting to `SameSite=None` (which requires `Secure`) in production makes the
// refresh cookie cross-site sendable so the session survives a reload. When the
// API is instead served same-site with the frontend (e.g. shopflow.az +
// api.shopflow.az share the shopflow.az registrable domain) set
// COOKIE_SAMESITE=lax (or strict) to drop the third-party cookie and regain the
// built-in CSRF hardening.

import type { CookieOptions } from 'express';

export type SameSite = 'strict' | 'lax' | 'none';

export interface CookieEnv {
  /** config.NODE_ENV */
  nodeEnv: string;
  /** Optional explicit override (config.COOKIE_SAMESITE). */
  sameSite?: SameSite;
}

const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** The effective SameSite mode: explicit override wins, else None in production
 *  (cross-site *.vercel.app) and Lax everywhere else (same-site local dev). */
export function resolveSameSite(env: CookieEnv): SameSite {
  if (env.sameSite) {
    return env.sameSite;
  }
  return env.nodeEnv === 'production' ? 'none' : 'lax';
}

/** Options for setting the refresh-token cookie via res.cookie(). */
export function resolveRefreshCookieOptions(env: CookieEnv): CookieOptions {
  const sameSite = resolveSameSite(env);
  // SameSite=None is only honored alongside Secure; also force Secure in
  // production so the cookie is never sent over plain HTTP.
  const secure = sameSite === 'none' || env.nodeEnv === 'production';

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: '/',
  };
}

/** Options for clearing the refresh-token cookie. Browsers only remove a cookie
 *  when the delete matches the original name/path/SameSite/Secure, so this mirrors
 *  the set options minus maxAge (res.clearCookie sets the expiry itself). */
export function resolveClearRefreshCookieOptions(env: CookieEnv): CookieOptions {
  const { maxAge: _maxAge, ...rest } = resolveRefreshCookieOptions(env);
  void _maxAge;
  return rest;
}
