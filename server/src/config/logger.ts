// src/config/logger.ts
// Winston structured logger — JSON in production, colorized in development

import winston from 'winston';
import { config } from './env';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const developmentFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  simple()
);

const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// File transports need a writable disk. Serverless platforms (Vercel) have a
// read-only filesystem except /tmp, so writing to `logs/` throws ENOENT at
// startup. Only add file logging on a real server; on Vercel the Console
// transport is captured into the platform's log stream.
const useFileLogs = config.NODE_ENV === 'production' && !process.env.VERCEL;

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: config.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console(),
    ...(useFileLogs
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
  exitOnError: false,
});
