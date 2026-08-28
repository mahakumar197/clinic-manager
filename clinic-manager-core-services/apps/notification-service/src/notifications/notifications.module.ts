import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { NotificationRule } from '../admin-notifications/entities/notification-rule.entity';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';
import { MailModule } from './services/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationTemplate,
      NotificationRule,
    ]),
    MailModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, SmsService, PushService],
  exports: [NotificationsService, EmailService, SmsService, PushService],
})
export class NotificationsModule {}
