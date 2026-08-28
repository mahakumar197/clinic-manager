import { useState } from "react";
import { handleMultiSheetExcelExport, MultiSheetExcelConfig } from "@/utils";
import reportsService from "@/services/modules/reports.service";
import { toast } from "@/utils/toast";

/**
 * Admin Reports Export Filters
 */
interface AdminReportsExportFilters {
  filter?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Custom hook for exporting admin reports to Excel (multi-sheet)
 * Encapsulates all admin reports export logic and configuration
 *
 * @returns Object with export function and loading state
 */
export const useAdminReportsExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export admin reports with current filters
   * Creates a multi-sheet Excel file with:
   * - Dashboard Metrics
   * - Performance by User
   * - App Engagement Trends
   * - Content Performance
   * - Headcounts
   */
  const exportAdminReports = async (
    filters: AdminReportsExportFilters = {},
  ) => {
    await handleMultiSheetExcelExport(
      // API call function - returns MultiSheetExcelConfig
      async () => {
        // Build payload
        const payload: {
          filter?: string;
          startDate?: string;
          endDate?: string;
        } = {};

        if (filters.filter) {
          payload.filter = filters.filter;
        }

        if (filters.startDate && filters.endDate) {
          payload.startDate = filters.startDate;
          payload.endDate = filters.endDate;
        }

        const response = await reportsService.exportAdminReports(payload);

        // Transform dashboard card data into array format for Excel
        // dashboardCard is an array, find each metric by key
        const conversionRate = response.data.dashboardCard.find((item: any) => item.key === "conversionRate");
        const averageResponse = response.data.dashboardCard.find((item: any) => item.key === "averageResponse");

        const dashboardMetrics = [
          {
            metric: "Conversion Rate",
            value: `${conversionRate?.percentage ?? 0}%`,
            change: `${(conversionRate?.change ?? 0) >= 0 ? '+' : ''}${conversionRate?.change ?? 0}%`,
          },
          {
            metric: "Average Response Time",
            value: `${averageResponse?.avgHours ?? 0}h`,
            change: `${(averageResponse?.change ?? 0) >= 0 ? '+' : ''}${averageResponse?.change ?? 0}h`,
          },
        ];

        // Build and return multi-sheet configuration
        const config: MultiSheetExcelConfig = {
          sheets: [
            // Sheet 1: Dashboard Metrics (Summary)
            {
              sheetName: "Dashboard Metrics",
              columns: [
                { key: "metric", label: "Metric", width: 30 },
                { key: "value", label: "Value", width: 15 },
                { key: "change", label: "Change", width: 15 },
              ],
              data: dashboardMetrics,
            },
            // Sheet 2: Performance by User
            {
              sheetName: "Performance by User",
              columns: [
                { key: "userName", label: "User Name", width: 25 },
                { key: "role", label: "Role", width: 15 },
                { key: "tasksCompleted", label: "Tasks Completed", width: 18 },
                { key: "avgResponse", label: "Avg Response", width: 15 },
                { key: "satisfaction", label: "Satisfaction", width: 15 },
              ],
              data: response.data.performance,
            },
            // Sheet 3: App Engagement Trends
            {
              sheetName: "App Engagement Trends",
              columns: [
                { key: "month", label: "Month", width: 15 },
                { key: "activeuser", label: "Active Users", width: 15 },
                { key: "guestuser", label: "Guest Users", width: 15 },
              ],
              data: response.data.appEngagement,
            },
            // Sheet 4: Content Performance
            {
              sheetName: "Content Performance",
              columns: [
                { key: "label", label: "Content Type", width: 20 },
                { key: "totalViews", label: "Total Views", width: 15 },
                { key: "engagement", label: "Engagement", width: 15 },
              ],
              data: response.data.contentPerformance,
            },
            {
              sheetName: "Headcounts",
              columns: [
                { key: "role", label: "Role", width: 20 },
                { key: "percentage", label: "Percentage (%)", width: 18 },
              ],
              data: response.data.headcount,
            },
          ],
          fileNamePrefix: "admin_reports_export",
          defaultHeaderBgColor: "E9A708", // Golden
          defaultHeaderTextColor: "FFFFFF", // White
        };

        return config;
      },
      // On start callback
      () => {
        setIsExporting(true);
      },
      // On success callback
      () => {
        setIsExporting(false);
        toast.success("Admin reports exported successfully");
      },
      // On error callback
      (errorMessage) => {
        setIsExporting(false);
        toast.error(errorMessage);
      },
    );
  };

  return {
    exportAdminReports,
    isExporting,
  };
};
