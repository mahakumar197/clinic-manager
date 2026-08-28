import { Injectable, Logger } from '@nestjs/common';
import {
  PerformanceQueryDto,
  ReportsQueryDto,
  ReportsStaffQueryDto,
} from './dto/report.dto';
import { ConfigService } from '@nestjs/config';
import { API_ENDPOINTS } from '@pallmall/common-utils';
import { helpers } from '@pallmall/common-utils';
import { UserRole } from '@pallmall/shared-types';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private configService: ConfigService) {}

  async getStaffDashboard(userId: string, query: ReportsStaffQueryDto) {
    this.logger.log('[getStaffDashboard] Fetching staff dashboard');

    const { filter, startDate, endDate } = query;
    const uri = this.configService.get('BASE_CONTENT');

    try {
      this.logger.log('[getStaffDashboard] Calling external APIs for staff reports');
      const [
        cards,
        weeklyApprovals,
        responseTimeTrend,
        formTypeBreakdown,
        performanceSummary,
      ] = await Promise.all([
        helpers.getReportsStaff(
          uri,
          API_ENDPOINTS.CONTENT_SERVICE.REPORTS_STAFF.DASHBOARD_CARDS_STAFFS,
          userId,
          filter,
          startDate,
          endDate,
        ),
        helpers.getReportsStaff(
          uri,
          API_ENDPOINTS.CONTENT_SERVICE.REPORTS_STAFF
            .DASHBOARD_WEEKLY_FORM_APPROVALS,
          userId,
          filter,
          startDate,
          endDate,
        ),
        helpers.getReportsStaff(
          uri,
          API_ENDPOINTS.CONTENT_SERVICE.REPORTS_STAFF.RESPONSE_TIME_TREND,
          userId,
          filter,
          startDate,
          endDate,
        ),
        helpers.getReportsStaff(
          uri,
          API_ENDPOINTS.CONTENT_SERVICE.REPORTS_STAFF.FORM_TYPE_BREAKDOWN,
          userId,
          filter,
          startDate,
          endDate,
        ),
        helpers.getReportsStaff(
          uri,
          API_ENDPOINTS.CONTENT_SERVICE.REPORTS_STAFF.PERFORMANCE_SUMMARY,
          userId,
          filter,
          startDate,
          endDate,
        ),
      ]);

      this.logger.debug('[getStaffDashboard] Successfully retrieved staff dashboard data');
      return {
        success: true,
        data: {
          cards: cards?.data ?? cards,
          weeklyApprovals: weeklyApprovals?.data ?? weeklyApprovals,
          responseTimeTrend: responseTimeTrend?.data ?? responseTimeTrend,
          formTypeBreakdown: formTypeBreakdown?.data ?? formTypeBreakdown,
          performanceSummary: performanceSummary?.data ?? performanceSummary,
        },
      };
    } catch (error: any) {
      this.logger.error(`[getStaffDashboard] Error fetching staff dashboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPerformanceByUser(query: PerformanceQueryDto) {
    this.logger.log('[getPerformanceByUser] Fetching performance by user');

    try {
      const uri = this.configService.get('BASE_CONTENT');
      const urlPath =
        API_ENDPOINTS.CONTENT_SERVICE.REPORTS_ADMIN.PERFORMANCE_BY_USER;

      this.logger.log('[getPerformanceByUser] Calling admin reports API for performance');
      const response = await helpers.getReportsAdmin(uri, urlPath, query);

      const performance = response?.data?.[0]?.performance ?? [];

      const pagination = response?.meta?.pagination;

      const page = Number(pagination?.page ?? query.page ?? 1);
      const limit = Number(pagination?.limit ?? query.limit ?? 10);
      const total = Number(pagination?.total ?? performance.length);

      const totalPages =
        pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));

      this.logger.debug('[getPerformanceByUser] Successfully retrieved user performance data');
      return new ApiResponseBuilder().paginated(
        [
          {
            performance,
          },
        ],
        {
          total,
          page,
          limit,
          totalPages,
          hasPrev: page > 1,
          hasNext: page < totalPages,
        },
        response.message ?? 'Performance data fetched successfully',
      );
    } catch (error: any) {
      this.logger.error(`[getPerformanceByUser] Error fetching user performance: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAdminReports(query: ReportsQueryDto) {
    this.logger.log('[getAdminReports] Fetching admin dashboard reports');

    try {
      const uri = this.configService.get('BASE_CONTENT');

      const endpoints = {
        dashboardCards:
          API_ENDPOINTS.CONTENT_SERVICE.REPORTS_ADMIN.DASHBOARD_CARDS,
        headcount: API_ENDPOINTS.CONTENT_SERVICE.REPORTS_ADMIN.HEADCOUNT,
        contentPerformance:
          API_ENDPOINTS.CONTENT_SERVICE.REPORTS_ADMIN.CONTENT_PERFORMANCE,
        appTrend:
          API_ENDPOINTS.CONTENT_SERVICE.REPORTS_ADMIN.APP_ENGAGEMENT_TREND,
      };

      this.logger.log('[getAdminReports] Calling multiple admin reports APIs');
      const [cards, headcount, content, trend] = await Promise.all([
        helpers.getReportsAdmin(uri, endpoints.dashboardCards, query),
        helpers.getReportsAdmin(uri, endpoints.headcount, query),
        helpers.getReportsAdmin(uri, endpoints.contentPerformance, query),
        helpers.getReportsAdmin(uri, endpoints.appTrend, query),
      ]);

      this.logger.debug('[getAdminReports] Successfully retrieved admin dashboard data');
      return new ApiResponseBuilder().success(
        {
          dashboardCards: cards?.data || [],
          headcount: headcount?.data || [],
          contentPerformance: content?.data || [],
          appEngagementTrend: trend?.data || [],
        },
        'Dashboard data fetched successfully',
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[getAdminReports] Error fetching admin reports: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReportsExport(query: ReportsQueryDto) {
    this.logger.log('[getReportsExport] Exporting all admin reports');

    try {
      const uri = this.configService.get('BASE_CONTENT');
      const urlPath =
        API_ENDPOINTS.CONTENT_SERVICE.REPORTS_ADMIN.ALL_REPORTS_DATA;

      this.logger.log('[getReportsExport] Calling reports API for export');
      const response = await helpers.postReportsAdmin(uri, urlPath, query);

      this.logger.debug('[getReportsExport] Export data successfully retrieved');
      return new ApiResponseBuilder().success(
        response?.data ?? {},
        'All admin reports fetched successfully',
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[getReportsExport] Error exporting admin reports: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStaffReportsExport(userId: string, query: ReportsStaffQueryDto) {
    this.logger.log('[getStaffReportsExport] Exporting staff reports');

    try {
      const uri = this.configService.get('BASE_CONTENT');
      const urlPath =
        API_ENDPOINTS.CONTENT_SERVICE.REPORTS_STAFF.EXPORT_REPORTS_STAFF;

      const body = {
        ...query,
        userId,
      };

      this.logger.log('[getStaffReportsExport] Calling staff reports API for export');
      const response = await helpers.postReportsStaff(uri, urlPath, body);

      this.logger.debug('[getStaffReportsExport] Staff export data successfully retrieved');
      return new ApiResponseBuilder().success(
        response?.data ?? {},
        'All staff reports fetched successfully',
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[getStaffReportsExport] Error exporting staff reports: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
