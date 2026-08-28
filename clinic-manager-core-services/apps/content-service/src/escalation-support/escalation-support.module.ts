import { Module } from '@nestjs/common';
import { EscalationSupportController } from './escalation-support.controller';
import { MessageModule } from '../message/message.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [MessageModule, TasksModule],
  controllers: [EscalationSupportController],
})
export class EscalationSupportModule {}
