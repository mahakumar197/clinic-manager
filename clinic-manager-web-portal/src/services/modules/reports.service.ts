import reportsAxiosInstance from "../api/reportsAxiosInstance";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Dashboard Reports Response Types
 */
export interface DashboardCardsResponse {
  conversionRate: {
    percentage: number;
    change: number;
  };
  averageResponse: {
    avgHours: number;
    change: number;
  };
}

export interface HeadcountItem {
  role: string;
  count: number;
}

export interface ContentPerformanceItem {
  label: string;
  totalViews: number;
  engagement: number;
}

export interface AppEngagementTrendItem {
  month: string;
  activeuser: number;
  guestuser: number;
}

export interface ReportsDashboardResponse {
  success: boolean;
  statusCode: number;
  data: {
    dashboardCards: DashboardCardsResponse;
    headcount: HeadcountItem[];
    contentPerformance: ContentPerformanceItem[];
    appEngagementTrend: AppEngagementTrendItem[];
  };
  message: string;
}

/**
 * Performance by User Response Types
 */
export interface PerformanceUserItem {
  userName: string;
  role: string;
  tasksCompleted: number;
  avgResponse: string;
  satisfaction: string;
}

export interface PerformanceByUserResponse {
  success: boolean;
  meta: {
    version: string;
    timestamp: string;
    requestId: string;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasPrev: boolean;
      hasNext: boolean;
    };
  };
  data: Array<{
    performance: PerformanceUserItem[];
  }>;
  message: string;
}

/**
 * User Reports Response Types
 */
export interface UserReportsCards {
  totalTaskCount: {
    count: number;
    change: number;
  };
  weekTaskCount: {
    count: number;
    change: number;
  };
  avgResponse: {
    avgResponseTimeInHours: number;
    avgResponseChange: number;
  };
  formSubmissions: number;
}

export interface WeeklyApprovalItem {
  day: string;
  count: number;
}

export interface ResponseTimeTrendItem {
  month: string;
  value: number;
}

export interface FormTypeBreakdownItem {
  formType: string;
  count: number;
  percentage: number;
}

export interface PerformanceSummary {
  completionRate: number;
  teamAverage: number;
  comparisonText: string;
  qualityScore: number;
  qualityLabel: string;
  outstandingPerformance?: boolean;
}

export interface UserReportsResponse {
  success: boolean;
  data: {
    cards: UserReportsCards;
    weeklyApprovals: WeeklyApprovalItem[];
    responseTimeTrend: ResponseTimeTrendItem[];
    formTypeBreakdown: FormTypeBreakdownItem[];
    performanceSummary: PerformanceSummary;
  };
}

/**
 * Service methods for Reports & Analytics
 */
const reportsService = {
  /**
   * Get dashboard data including cards, headcounts, and content performance
   * @param filter - Optional predefined date filter (e.g., last30days, lastMonth)
   * @param startDate - Optional custom start date
   * @param endDate - Optional custom end date
   */
  async getReportsDashboard(
    filter?: string,
    startDate?: string,
    endDate?: string,
    signal?: AbortSignal
  ): Promise<ReportsDashboardResponse> {
    const params: Record<string, string> = {};
    
    if (filter) {
      params.filter = filter;
    }
    
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const response = await reportsAxiosInstance.get<ReportsDashboardResponse>(
      ENDPOINTS.REPORTS.DASHBOARD,
      { params, signal }
    );
    return response.data;
  },

  /**
   * Get performance by user data with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param filter - Optional predefined date filter
   * @param startDate - Optional custom start date
   * @param endDate - Optional custom end date
   */
  async getPerformanceByUser(
    page: number = 1,
    limit: number = 10,
    filter?: string,
    startDate?: string,
    endDate?: string,
    signal?: AbortSignal
  ): Promise<PerformanceByUserResponse> {
    const params: Record<string, string | number> = { page, limit };
    
    if (filter) {
      params.filter = filter;
    }
    
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const response = await reportsAxiosInstance.get<PerformanceByUserResponse>(
      ENDPOINTS.REPORTS.PERFORMANCE_BY_USER,
      { params, signal }
    );
    return response.data;
  },

  /**
   * Get user/personal reports dashboard data
   * @param filter - Optional predefined date filter
   * @param startDate - Optional custom start date
   * @param endDate - Optional custom end date
   */
  async getUserReports(
    filter?: string,
    startDate?: string,
    endDate?: string,
    signal?: AbortSignal
  ): Promise<UserReportsResponse> {
    const params: Record<string, string> = {};
    
    if (filter) {
      params.filter = filter;
    }
    
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const response = await reportsAxiosInstance.get<UserReportsResponse>(
      ENDPOINTS.REPORTS.USER_DASHBOARD,
      { params, signal }
    );
    return response.data;
  },

  /**
   * Export admin reports dashboard data (multi-sheet)
   * @param payload - Export filters
   */
  async exportAdminReports(payload: {
    filter?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AdminReportsExportResponse> {
    const response = await reportsAxiosInstance.post<AdminReportsExportResponse>(
      ENDPOINTS.REPORTS.EXPORT,
      payload
    );
    return response.data;
  },

  /**
   * Export user/staff reports dashboard data (multi-sheet)
   * @param payload - Export filters
   */
  async exportUserReports(payload: {
    filter?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<UserReportsExportResponse> {
    const response = await reportsAxiosInstance.post<UserReportsExportResponse>(
      ENDPOINTS.REPORTS.STAFF_EXPORT,
      payload
    );
    return response.data;
  },
};

/**
 * User Reports Export Response Types
 */
export interface UserReportsExportResponse {
  success: boolean;
  statusCode: number;
  data: {
    dashboardCard: Array<{
      key: string;
      count?: number;
      change?: number;
      avgResponseTimeInHours?: number;
      avgResponseChange?: number;
      value?: number;
    }>;
    weeklyFormApprovals: Array<{
      day: string;
      count: number;
    }>;
    responseTimeTrend: Array<{
      month: string;
      value: number;
    }>;
    formTypeBreakdown: Array<{
      label: string;
      count: number;
      percentage: number;
    }>;
    performanceSummary: Array<{
      key: string;
      value: number | string | boolean;
    }>;
  };
  message: string;
}

/**
 * Admin Reports Export Response Types
 */
export interface AdminPerformanceItem {
  userName: string;
  role: string;
  tasksCompleted: number;
  avgResponse: string;
  satisfaction: string;
}

export interface AdminReportsExportResponse {
  success: boolean;
  statusCode: number;
  data: {
    dashboardCard: Array<{
      key: string;
      percentage?: number;
      avgHours?: number;
      change: number;
    }>;
    performance: AdminPerformanceItem[];
    contentPerformance: ContentPerformanceItem[];
    headcount: HeadcountItem[];
    appEngagement: AppEngagementTrendItem[];
  };
  message: string;
}

export default reportsService;
