import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { ContentModule } from './content/content.module';
import { JourneyModule } from './journey/journey.module';
import { MessageModule } from './message/message.module';
import { TasksModule } from './tasks/tasks.module';
import { ProceduresModule } from './procedures/procedures.module';
import { MediaModule } from './media/media.module';
import { MasterModule } from './master/master.module';
import { ElearningsModule } from './elearnings/elearnings.module';
import { FormsModule } from './forms/forms.module';
import { ApprovalsAdminModule } from './approvals-admin/approvals-admin.module';
import { HomeModule } from './home/home.module';
import { ApprovalDoctorModule } from './approval-doctor/approval-doctor.module';
import { EscalationSupportModule } from './escalation-support/escalation-support.module';
import { ReportsModule } from './reports-helper/reports.module';
import { LoggingModule } from '@pallmall/logger';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
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
          database: configService.get('DB_NAME_CONTENT', 'pallmall_cms_db'),
          entities: [__dirname + '/**/*.entity.{ts,js}'],
          synchronize: false,
        };
      },
    }),
    MediaModule,
    TerminusModule,
    ContentModule,
    JourneyModule,
    TasksModule,
    ProceduresModule,
    MessageModule,
    MasterModule,
    ElearningsModule,
    FormsModule,
    ApprovalsAdminModule,
    HomeModule,
    ApprovalDoctorModule,
    EscalationSupportModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
