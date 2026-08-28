import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@pallmall/logger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  process.env.SERVICE_NAME =
    process.env.CONTENT_SERVICE || 'content-service';
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global API versioning
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Content & Journey Service')
    .setDescription('pallmall Management System - Content & Journey API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('content', 'Content management endpoints')
    .addTag('procedures', 'Medical procedures endpoints')
    .addTag('media', 'Media management endpoints')
    .addTag('journey', 'Patient journey endpoints')
    .addTag('message', 'Messaging endpoints')
    .addTag('health', 'Health check endpoints')
    .addTag('tasks', 'Tasks management endpoints')
    .addTag('Task Comments', 'Task Comment endpoints')
    .addTag('tasks-attachments', 'Task-Attachment endpoints')
    .addTag('Task Templates', 'Task Templates endpoints')
    .addTag('Master API-Dropdowns', 'Master API-Dropdowns endpoints')
    .addTag('Master API-filters', 'Master API-filters endpoints')
    .addTag('elearnings', 'elearnings endpoints')
    .addTag('forms', 'forms endpoints')
    .addTag('forms-submissions', 'forms-submissions endpoints')
    .addTag('forms-Questions', 'forms-Questions endpoints')
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

  const port = process.env.PORT_CONTENT || 3003;
  await app.listen(port);
  logger.info(`Content Service is running on port ${port}`);
  logger.info(
    `Swagger documentation available at http://localhost:${port}/api`,
  );
}
bootstrap();
