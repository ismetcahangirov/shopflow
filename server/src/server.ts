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

import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import couponRoutes from './routes/couponRoutes';
import addressRoutes from './routes/addressRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes';
import { stripeWebhook } from './controllers/paymentController';

// ── App setup ────────────────────────────────────────────
const app = express();

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

if (config.NODE_ENV !== 'test') {
  main().catch((err: unknown) => {
    logger.error('Failed to start server', { err });
    process.exit(1);
  });
}

export { app };
