import { Controller, Get, Query, HttpStatus, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from '../service/reports-admin.service';
import { PerformanceQueryDto, ReportsQueryDto } from '../dto/reports.dto';

@ApiTags('Reports')
@Controller('reports-admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-cards')
  @ApiOperation({ summary: 'gets dashboard cards data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard cards fetched successfully',
  })
  getDashboardCards(@Query() query: ReportsQueryDto) {
    return this.reportsService.getDashboardCards(query);
  }

  @Get('headcount')
  @ApiOperation({ summary: 'Get headcount by role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Headcount fetched successfully',
  })
  getHeadcount(@Query() query: ReportsQueryDto) {
    return this.reportsService.getHeadcountByRole(query);
  }

  @Get('performance-by-user')
  @ApiOperation({ summary: 'Get performance by user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User performance fetched successfully',
  })
  getPerformanceByUser(@Query() query: PerformanceQueryDto) {
    return this.reportsService.getPerformanceByUser(query);
  }

  @Get('content-performance')
  @ApiOperation({ summary: 'Get content performance metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Content performance fetched successfully',
  })
  getContentPerformance(@Query() query: ReportsQueryDto) {
    return this.reportsService.getContentPerformance(query);
  }

  @Get('app-engagement-trends')
  getAppEngagementTrends(@Query() query: ReportsQueryDto) {
    return this.reportsService.getAppEngagementTrends(query);
  }

  @Post('export-report-data')
  async getAllReports(@Body() filters?: ReportsQueryDto) {
    return this.reportsService.getAllReports(filters ?? {});
  }
}
