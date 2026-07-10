// src/server.ts
// Express app entry point — wires together all middleware, routes, and starts the server

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { corsOptions } from './config/corsOptions';
import { logger } from './config/logger';
import { apiLimiter } from './middleware/rateLimiter';
import { errorMiddleware } from './middleware/errorMiddleware';
import { warnIfSenderUnverifiable } from './utils/sendEmail';

import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import couponRoutes from './routes/couponRoutes';
import addressRoutes from './routes/addressRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import reviewRoutes from './routes/reviewRoutes';
import userRoutes from './routes/userRoutes';
import vendorRoutes from './routes/vendorRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { stripeWebhook } from './controllers/paymentController';

// ── App setup ────────────────────────────────────────────
const app = express();

// Surface an unverifiable EMAIL_FROM immediately on boot (Vercel cold start or
// local) rather than only via silently-failed emails later (issue #89).
if (config.NODE_ENV !== 'test') {
  warnIfSenderUnverifiable();
}

// ── Trust proxy ──────────────────────────────────────────
// On Vercel every request arrives through Vercel's proxy, so `X-Forwarded-For`
// is always present. Tell Express to trust exactly one proxy hop so
// express-rate-limit (and req.ip) can resolve the real client IP instead of
// throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR. We intentionally do NOT use
// `true`: trusting every proxy would let a client spoof `X-Forwarded-For` and
// evade the rate limiter. Off Vercel (local dev/tests) there is no proxy, so the
// setting stays at Express's safe default of `false`.
if (process.env.VERCEL) {
  app.set('trust proxy', 1);
}

// ── Security headers ─────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.stripe.com', 'https://accounts.google.com'],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        scriptSrc: ["'self'", 'https://js.stripe.com'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// ── CORS ─────────────────────────────────────────────────
app.use(cors(corsOptions));

// ── Logging ──────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
    skip: (_req, res) => res.statusCode < 400 && config.NODE_ENV === 'production',
  })
);

// ── Body parsing ─────────────────────────────────────────
// Stripe webhook needs raw body — MUST be registered BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Rate limiting ─────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Routes ────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// ── 404 handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route tapılmadı',
    error: 'NOT_FOUND',
    statusCode: 404,
  });
});

// ── Global error handler ──────────────────────────────────
app.use(errorMiddleware);

// ── Server startup ────────────────────────────────────────
const PORT = parseInt(config.PORT, 10);

async function main(): Promise<void> {
  await connectDB();
  logger.info('✅ PostgreSQL bağlantısı uğurludur');

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server: http://localhost:${PORT}`);
    logger.info(`📦 Environment: ${config.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // Unhandled rejections — log and exit
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled rejection', { reason });
    server.close(() => process.exit(1));
  });
}

// On Vercel the exported `app` is invoked per-request as a serverless handler —
// it must NOT bind a port (app.listen) or eagerly connectDB()/process.exit() on
// failure. Only run the long-lived server bootstrap on a real host.
if (config.NODE_ENV !== 'test' && !process.env.VERCEL) {
  main().catch((err: unknown) => {
    logger.error('Failed to start server', { err });
    process.exit(1);
  });
}

export { app };
