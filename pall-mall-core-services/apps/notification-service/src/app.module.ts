import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationTemplate } from './notifications/entities/notification-template.entity';
import { AdminNotificationModule } from './admin-notifications/admin-notification.module';
import { EscalationRule } from './admin-notifications/entities/escalation-rule.entity';
import { NotificationRule } from './admin-notifications/entities/notification-rule.entity';
import { AuthModule } from '@pallmall/shared-types';
import { KafkaModule } from './kafka/kafka.module';
import { LoggingModule } from '@pallmall/logger';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,LoggingModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: parseInt(configService.get('DB_PORT', '5432')),
          username: configService.get('DB_USERNAME', 'admin'),
          password: configService.get('DB_PASSWORD', 'password'),
          database: configService.get(
            'DB_NAME_NOTIFICATION',
            'pallmall_notifications_db',
          ),
          entities: [
            Notification,
            NotificationTemplate,
            EscalationRule,
            NotificationRule,
          ],
          synchronize: false,
        };
      },
    }),
    TerminusModule,
    NotificationsModule,
    AdminNotificationModule,
    AuthModule,
    KafkaModule,
    CronModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
