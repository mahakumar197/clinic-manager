import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from '@pallmall/logger';

async function bootstrap() {
  process.env.SERVICE_NAME =
    process.env.PATIENT_SERVICE || 'patient-service';
  const app = await NestFactory.create(AppModule);

  // Global API versioning
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Patient Service')
    .setDescription('pallmall Management System - Patient Service API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('patients', 'Patient management endpoints')
    .addTag('health', 'Health check endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT_PATIENT || 3002;
  await app.listen(port);
  logger.info(`Patient Service is running on port ${port}`);
  logger.info(
    `Swagger documentation available at http://localhost:${port}/api`,
  );
}
bootstrap();
