import { Module } from '@nestjs/common';
import { EscalationCronService } from './escalation-cron.service';
import { EscalationCronController } from './escalation-cron.controller';

@Module({
  providers: [EscalationCronService],
  controllers: [EscalationCronController],
  exports: [EscalationCronService],
})
export class EscalationCronModule {}
