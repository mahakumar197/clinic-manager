import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health/health.controller';
import { ZohoModule } from './zoho/zoho.module';
import { WebhooksController } from './webhooks/webhooks.controller';
import { EscalationCronModule } from './escalation-cron/escalation-cron.module';
import { ReportsModule } from './reports/reports.module';
import { LoggingModule } from '@pallmall/logger';
import { WebhooksModule } from './webhooks/webhook.module';
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
            'DB_NAME_INTEGRATION',
            'pallmall_integrations_db',
          ),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
        };
      },
    }),
    TerminusModule,
    ZohoModule,
    EscalationCronModule,
    ReportsModule,
    WebhooksModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
