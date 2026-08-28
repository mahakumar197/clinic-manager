import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@pallmall/logger';

async function bootstrap() {
  process.env.SERVICE_NAME =
    process.env.INTEGRATION_SERVICE || 'integration-service';
  const app = await NestFactory.create(AppModule);

  // Global API versioning
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Integration Service')
    .setDescription('pallmall Management System - Integration Service API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('zoho', 'Zoho CRM integration endpoints')
    .addTag('webhooks', 'Webhook endpoints')
    .addTag('health', 'Health check endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'x-internal-api-key',
    ],
  });

  const port = process.env.PORT_INTEGRATION || 3005;
  await app.listen(port);
  logger.info(`Integration Service is running on port ${port}`);
  logger.info(
    `Swagger documentation available at http://localhost:${port}/api`,
  );
}
bootstrap();
