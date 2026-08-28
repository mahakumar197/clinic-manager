import { Controller, Post, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EscalationCronService } from './escalation-cron.service';

@ApiTags('Escalation Cron')
@Controller('escalation-cron')
export class EscalationCronController {
  private readonly logger = new Logger(EscalationCronController.name);

  constructor(private readonly escalationCronService: EscalationCronService) {}

  @Post('no-response/trigger')
  @ApiOperation({
    summary: 'Manually trigger NO_RESPONSE escalation check',
    description:
      'Checks for patient messages that have not been responded to and triggers escalation notifications',
  })
  async triggerNoResponseCheck() {
    this.logger.log('[triggerNoResponseCheck] Endpoint hit');
    await this.escalationCronService.manualCheckNoResponse();
    return {
      success: true,
      message: 'NO_RESPONSE escalation check triggered',
    };
  }

  @Post('overdue-tasks/trigger')
  @ApiOperation({
    summary: 'Manually trigger TASK_OVERDUE escalation check',
    description:
      'Checks for tasks that are overdue and triggers escalation notifications',
  })
  async triggerOverdueTasksCheck() {
    this.logger.log('[triggerOverdueTasksCheck] Endpoint hit');
    await this.escalationCronService.manualCheckOverdueTasks();
    return {
      success: true,
      message: 'TASK_OVERDUE escalation check triggered',
    };
  }
}
