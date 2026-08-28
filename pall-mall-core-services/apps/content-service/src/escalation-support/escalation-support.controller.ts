import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { MessageService } from '../message/message.service';
import { TasksService } from '../tasks/service/tasks.service';

@ApiTags('Escalation Support - Internal')
@Controller()
export class EscalationSupportController {
  private readonly logger = new Logger(EscalationSupportController.name);
  private readonly internalApiKey =
    process.env.INTERNAL_API_KEY || 'internal-secret-key-2024';

  constructor(
    private readonly messageService: MessageService,
    private readonly tasksService: TasksService,
  ) {}

  private validateInternalKey(apiKey: string) {
    if (!apiKey) {
      throw new UnauthorizedException('Missing internal API key');
    }

    if (apiKey !== this.internalApiKey) {
      throw new UnauthorizedException('Invalid internal API key');
    }
  }

  @Get('escalation/threads')
  @ApiOperation({
    summary: 'Get all open threads for escalation check (Internal)',
    description:
      'Returns all threads with status OPEN for no-response escalation checking',
  })
  async getOpenThreadsForEscalation() {
    return this.messageService.getOpenThreadsForEscalation();
  }

  @Get('escalation/threads/:threadId/messages')
  @ApiOperation({
    summary: 'Get messages for a thread (Internal)',
    description: 'Returns all messages in a thread ordered by creation time',
  })
  async getThreadMessagesForEscalation(@Param('threadId') threadId: string) {
    return this.messageService.getThreadMessagesForEscalation(threadId);
  }

  @Get('escalation/tasks')
  @ApiOperation({
    summary: 'Get tasks for escalation check (Internal)',
    description: 'Returns tasks filtered by status for overdue checking',
  })
  @ApiQuery({ name: 'status', required: false, type: Number })
  async getTasksForEscalation(@Query('status') status?: number) {
    return this.tasksService.getTasksForEscalation(status);
  }
}
