export * from './logging.module';
export * from './logger.service';
export * from './logging.interceptor';

import { AsyncLocalStorage } from 'async_hooks';
import * as winston from 'winston';

export const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});
