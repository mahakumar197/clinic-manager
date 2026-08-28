import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsStaffQueryDto } from '../dto/reports.dto';
import { ReportsStaffsService } from '../service/reports-staff.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Reports-staffs')
@Controller('Reports-staffs')
export class ReportsStaffController {
  constructor(private readonly reportsStaffsService: ReportsStaffsService) {}

  @Get('dashboard-cards-staffs')
  @ApiOperation({ summary: 'gets dashboard cards data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard cards fetched successfully',
  })
  getDashboardCards(@Query() query: ReportsStaffQueryDto) {
    return this.reportsStaffsService.getCards(query.userId, query);
  }

  @Get('dashboard-weekly-formApprovals')
  @ApiOperation({ summary: 'gets dashboard cards data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard cards fetched successfully',
  })
  weeklyFormApprovals(@Query() query: ReportsStaffQueryDto) {
    return this.reportsStaffsService.getWeeklyApprovalsGraph(
      query.userId,
      query,
    );
  }

  @Get('response-time-trend')
  @ApiOperation({ summary: 'gets response time trend' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Response time trend fetched successfully',
  })
  responseTimeTrend(@Query() query: ReportsStaffQueryDto) {
    return this.reportsStaffsService.getResponseTimeTrend(query.userId, query);
  }

  @Get('form-type-breakdown')
  @ApiOperation({ summary: 'gets form type breakdown' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form type breakdown fetched successfully',
  })
  formTypeBreakdown(@Query() query: ReportsStaffQueryDto) {
    return this.reportsStaffsService.formTypeBreakdown(query.userId, query);
  }

  @Get('performance-summary')
  @ApiOperation({ summary: 'gets performance summary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Performance summary fetched successfully',
  })
  performanceSummary(@Query() query: ReportsStaffQueryDto) {
    return this.reportsStaffsService.performanceSummary(query.userId);
  }

  @Post('export-report-staff')
  @ApiOperation({ summary: 'Export all staff reports data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All staff reports fetched successfully',
  })
  async getAllReports(@Body() filters: ReportsStaffQueryDto) {
    return this.reportsStaffsService.getAllReports(filters.userId, filters);
  }
}
