import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@pallmall/logger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  process.env.SERVICE_NAME =
    process.env.OPERATIONS_SERVICE || 'operations-service';
  const app = await NestFactory.create(AppModule);

  // Global API versioning
  app.setGlobalPrefix('api/v1');
  // Swagger configuration (before global prefix!)
  const config = new DocumentBuilder()
    .setTitle('Operations & Analytics Service')
    .setDescription('pallmall Management System - Operations & Analytics API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('health', 'Health check endpoints')
    .addTag('audit', 'Audit log endpoints')
    .addTag('user-management', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser());

  // Security: Helmet.js
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global sanitization pipe
  app.useGlobalPipes(new SanitizationPipe());

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT_OPERATIONS || 3001;
  await app.listen(port);
  logger.info(`Operations Service is running on port ${port}`);
  logger.info(
    `Swagger documentation available at http://localhost:${port}/api`,
  );
  logger.info('Security: Helmet.js enabled');
  logger.info('Security: Rate limiting enabled');
  logger.info('Security: Global exception filter enabled');
}
bootstrap();
