// src/config/stripe.ts
// Stripe initialization with secret key from environment

import Stripe from 'stripe';
import { config } from './env';

export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia' as const,
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = config.STRIPE_WEBHOOK_SECRET;
