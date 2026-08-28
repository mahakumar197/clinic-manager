import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@pallmall/logger';

async function bootstrap() {
  process.env.SERVICE_NAME =
    process.env.NOTIFICATION_SERVICE || 'notification-service';
  const app = await NestFactory.create(AppModule);

  // Global API versioning
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription('pallmall Management System - Notification Service API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('notifications', 'Notification endpoints')
    .addTag('health', 'Health check endpoints')
    .addTag('Admin Notifications', 'Admin Notifications endpoints')
    .addTag('Admin Escalations', 'Admin Escalations endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT_NOTIFICATION || 3004;
  await app.listen(port);
  logger.info(`Notification Service is running on port ${port}`);
  logger.info(
    `Swagger documentation available at http://localhost:${port}/api`,
  );
}
bootstrap();
