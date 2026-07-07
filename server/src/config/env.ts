// src/config/env.ts
// Centralized environment variable validation — fails at startup if any are missing

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(64, 'JWT_REFRESH_SECRET must be at least 64 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Client
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),

  // CORS — extra allowed origins (comma-separated, e.g. production/custom domains)
  // so new frontend URLs can be whitelisted via env without a code change.
  CORS_EXTRA_ORIGINS: z.string().optional(),
  // Allow this project's Vercel preview deployments (shopflow-*.vercel.app).
  // Off by default — opt in per environment with "true".
  CORS_ALLOW_VERCEL_PREVIEWS: z.enum(['true', 'false']).default('false'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  // Resend
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
});

function validateEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `  ❌ ${err.path.join('.')}: ${err.message}`)
      .join('\n');

    throw new Error(`\n🚫 Environment validation failed:\n${errors}\n`);
  }

  return result.data;
}

export const config = validateEnv();
