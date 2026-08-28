import { Injectable, Logger } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppLogger extends Logger {
  constructor(private readonly pinoLogger: PinoLogger) {
    super();
  }

  log(message: string, context?: string) {
    this.pinoLogger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.pinoLogger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.pinoLogger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.pinoLogger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.pinoLogger.trace(message, { context });
  }
}
