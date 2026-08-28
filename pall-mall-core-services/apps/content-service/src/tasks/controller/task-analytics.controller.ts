import { Controller, Get, UseGuards } from '@nestjs/common';
import { TaskAnalyticsService } from '../service/task-analytics.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TaskMetricsResponseDto } from '../dto/task-analytics.dto';

@ApiTags('Task Analytics')
@Controller('task-analytics')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TaskAnalyticsController {
  constructor(private readonly taskAnalyticsService: TaskAnalyticsService) {}

  @Get('metrics')
  @ApiOperation({
    summary: 'Get task metrics for dashboard',
    description:
      'Returns task approval metrics: Total Approvals (this month vs last month), This Week (this week vs last week), Avg Response Time (this month vs last month), Outstanding Forms',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task metrics fetched successfully',
    type: TaskMetricsResponseDto,
  })
  getTaskMetrics() {
    return this.taskAnalyticsService.getTaskMetrics();
  }
}
