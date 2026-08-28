import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { UserModule } from './user-management/user.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { User } from './users/entities/user.entity';
import { RolePermission } from './user-management/entities/role-permission.entity';
import { Otp } from './auth/entities/otp.entity';
import { AuthAttempt } from './auth/entities/auth-attempt.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { UserProfileModule } from './user-profile/user-profile.module';
import { UserProfile } from './user-profile/entities/user-profile.entity';
import { ForceUpdate } from './auth/entities/force-update.entity';
import { ResetToken } from './auth/entities/reset-token.entity';
import { PatientInformation } from './users/entities/patient-information.entity';
import { LoggingModule } from '@pallmall/logger';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggingModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: parseInt(configService.get('DB_PORT', '5432')),
          username: configService.get('DB_USERNAME', 'admin'),
          password: configService.get('DB_PASSWORD', 'password'),
          database: configService.get(
            'DB_NAME_OPERATIONS',
            'pallmall_operations_db',
          ),
          entities: [
            User,
            Otp,
            AuthAttempt,
            AuditLog,
            UserProfile,
            RolePermission,
            ForceUpdate,
            PatientInformation,
            ResetToken,
          ],
          synchronize: false, // Use migrations in production
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000'), // 60 seconds
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests
      },
    ]),
    TerminusModule,
    ScheduleModule.forRoot(),
    UsersModule,
    UserModule,
    AuthModule,
    AuditModule,
    UserProfileModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
