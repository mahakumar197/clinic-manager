import { Module, Global } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppLogger } from './logger.service';
import { loggerConfig } from './logger.config';
@Global()
@Module({
  imports: [LoggerModule.forRoot(loggerConfig)],
  providers: [AppLogger],
  exports: [LoggerModule, AppLogger],
})
export class LoggingModule {}
