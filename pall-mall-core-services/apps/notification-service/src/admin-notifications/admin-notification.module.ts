import { Module } from '@nestjs/common';
import { AdminNotificationService } from './service/admin-notification.service';
import { AdminEscalationService } from './service/admin-escalation.service';
import { AdminNotificationController } from './controller/admin-notification.controller';
import { AdminEscalationController } from './controller/admin-escalation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRule } from './entities/notification-rule.entity';
import { EscalationRule } from './entities/escalation-rule.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { EscalationLog } from './entities/escalation-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationRule,
      EscalationRule,
      NotificationLog,
      EscalationLog,
    ]),
  ],
  controllers: [AdminNotificationController, AdminEscalationController],
  providers: [AdminNotificationService, AdminEscalationService],
})
export class AdminNotificationModule {}
