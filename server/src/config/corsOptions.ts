// src/config/corsOptions.ts
// CORS configuration — strict origin whitelist

import { CorsOptions } from 'cors';
import { config } from './env';

// Static, always-trusted origins: local dev (CLIENT_URL), custom domains, and
// the current production Vercel deployment. `shopflow-theta.vercel.app` is the
// live frontend — it MUST be present or the deployed site cannot reach the API
// (see issue #59).
const staticAllowedOrigins: string[] = [
  config.CLIENT_URL,
  'https://shopflow.az',
  'https://www.shopflow.az',
  'https://shopflow-theta.vercel.app',
];

// Additional origins supplied via env (comma-separated) — lets us whitelist a
// new production/custom domain without a code change or redeploy of source.
const envAllowedOrigins: string[] = (config.CORS_EXTRA_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const allowedOrigins: string[] = [
  ...new Set([...staticAllowedOrigins, ...envAllowedOrigins]),
];

// Vercel preview deployments for THIS project only (e.g.
// shopflow-git-<branch>-<scope>.vercel.app). Scoped to the `shopflow-` prefix
// instead of a blanket `*.vercel.app` — with `credentials: true` a wildcard
// would trust arbitrary third-party apps. Opt in via CORS_ALLOW_VERCEL_PREVIEWS.
const vercelPreviewPattern = /^https:\/\/shopflow-[a-z0-9-]+\.vercel\.app$/;
const allowVercelPreviews = config.CORS_ALLOW_VERCEL_PREVIEWS === 'true';

/** True if `origin` is permitted by the whitelist or (when enabled) the preview pattern. */
export function isOriginAllowed(origin: string): boolean {
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  if (allowVercelPreviews && vercelPreviewPattern.test(origin)) {
    return true;
  }
  return false;
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman, SSR)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours preflight cache
};
