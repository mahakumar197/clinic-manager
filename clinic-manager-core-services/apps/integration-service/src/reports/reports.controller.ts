import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  Logger,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  PerformanceQueryDto,
  ReportsQueryDto,
  ReportsStaffQueryDto,
} from './dto/report.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  getStaffDashboard(@Req() req, @Query() query: ReportsStaffQueryDto) {
    this.logger.log('[getStaffDashboard] Endpoint hit');
    return this.reportsService.getStaffDashboard(req.user.userId, query);
  }

  @Get('admin/reports')
  @ApiOperation({ summary: 'Fetch all reports and analytics data' })
  @ApiResponse({
    status: 200,
    description: 'Report and analytics data fetched successfully',
  })
  async getDashboard(@Query() query: ReportsQueryDto) {
    this.logger.log('[getDashboard] Endpoint hit');
    const result = await this.reportsService.getAdminReports(query);
    return result;
  }

  @Get('admin/performance-by-user')
  @ApiOperation({ summary: 'Get performance by user' })
  @ApiResponse({
    status: 200,
    description: 'Performance by user fetched successfully',
  })
  getPerformanceByUser(@Query() query: PerformanceQueryDto) {
    this.logger.log('[getPerformanceByUser] Endpoint hit');
    return this.reportsService.getPerformanceByUser(query);
  }

  @Post('admin/reports-export')
  @ApiOperation({ summary: 'Fetch all reports and analytics data export' })
  @ApiResponse({
    status: 200,
    description: 'Report and analytics export data successfully',
  })
  getReportsExport(@Body() filters?: ReportsQueryDto) {
    this.logger.log('[getReportsExport] Endpoint hit');
    return this.reportsService.getReportsExport(filters ?? {});
  }

  @Post('staff/export')
  @ApiOperation({ summary: 'Fetch staff reports export data' })
  @ApiResponse({
    status: 200,
    description: 'Staff report export data fetched successfully',
  })
  getStaffReportsExport(@Req() req, @Body() filters: ReportsStaffQueryDto) {
    this.logger.log('[getStaffReportsExport] Endpoint hit');
    return this.reportsService.getStaffReportsExport(req.user.userId, filters);
  }
}
