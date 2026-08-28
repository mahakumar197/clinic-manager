import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { HealthController } from './health/health.controller';
import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/entities/patient.entity';
import { MedicalRecord } from './patients/entities/medical-record.entity';
import { ApiResponseInterceptor } from './common/api-response.interceptor';
import { GlobalExceptionFilter } from './common/global-exception.filter';
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
          database: configService.get('DB_NAME_PATIENT', 'pallmall_patient_db'),
          entities: [Patient, MedicalRecord],
          synchronize: true,
        };
      },
    }),
    TerminusModule,
    PatientsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
