import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { WebhooksController } from './webhooks.controller';
import { PatientForm } from './entity/patient-form.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksService } from './webhooks.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientForm,
    ]),
  ],
  controllers: [
    WebhooksController,
  ],
  providers: [
    MailService, WebhooksService
  ],
})
export class WebhooksModule {}