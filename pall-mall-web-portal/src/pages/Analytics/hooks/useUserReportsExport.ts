import { useState } from "react";
import { handleMultiSheetExcelExport, MultiSheetExcelConfig } from "@/utils";
import reportsService from "@/services/modules/reports.service";
import { toast } from "@/utils/toast";

/**
 * User Reports Export Filters
 */
interface UserReportsExportFilters {
  filter?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Custom hook for exporting user reports to Excel (multi-sheet)
 * Encapsulates all user reports export logic and configuration
 *
 * @returns Object with export function and loading state
 */
export const useUserReportsExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export user reports with current filters
   * Creates a multi-sheet Excel file with:
   * - Dashboard Metrics
   * - Weekly Form Approvals
   * - Response Time Trend
   * - Form Type Breakdown
   * - Performance Summary
   */
  const exportUserReports = async (
    filters: UserReportsExportFilters = {}
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

        const response = await reportsService.exportUserReports(payload);

        // Transform dashboard card data into array format for Excel
        const dashboardMetrics = response.data.dashboardCard.map((item) => {
          let metric = "";
          let value = "";
          let change = "";

          switch (item.key) {
            case "totalTaskCount":
              metric = "Total Task Count";
              value = String(item.count ?? 0);
              change = `${(item.change ?? 0) >= 0 ? "+" : ""}${item.change ?? 0}`;
              break;
            case "weekTaskCount":
              metric = "This Week Tasks";
              value = String(item.count ?? 0);
              change = `${(item.change ?? 0) >= 0 ? "+" : ""}${item.change ?? 0}`;
              break;
            case "avgResponse":
              metric = "Avg Response Time";
              value = `${item.avgResponseTimeInHours ?? 0}h`;
              change = `${(item.avgResponseChange ?? 0) >= 0 ? "+" : ""}${item.avgResponseChange ?? 0}h`;
              break;
            case "formSubmissions":
              metric = "Form Submissions";
              value = String(item.value ?? 0);
              change = "-";
              break;
          }

          return { metric, value, change };
        });

        // Transform performance summary data
        const performanceData = [];
        const perfMap = response.data.performanceSummary.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, any>);

        performanceData.push(
          {
            metric: "Completion Rate",
            value: `${perfMap.completionRate ?? 0}%`,
          },
          {
            metric: "Team Average",
            value: `${perfMap.teamAverage ?? 0}%`,
          },
          {
            metric: "Comparison",
            value: perfMap.comparisonText ?? "-",
          },
          {
            metric: "Quality Score",
            value: `${perfMap.qualityScore ?? 0}%`,
          },
          {
            metric: "Quality Label",
            value: perfMap.qualityLabel ?? "-",
          }
        );

        // Build and return multi-sheet configuration
        const config: MultiSheetExcelConfig = {
          sheets: [
            // Sheet 1: Dashboard Metrics
            {
              sheetName: "Dashboard Metrics",
              columns: [
                { key: "metric", label: "Metric", width: 30 },
                { key: "value", label: "Value", width: 15 },
                { key: "change", label: "Change", width: 15 },
              ],
              data: dashboardMetrics,
            },
            // Sheet 2: Weekly Form Approvals
            {
              sheetName: "Weekly Approvals",
              columns: [
                { key: "day", label: "Day", width: 15 },
                { key: "count", label: "Approvals", width: 15 },
              ],
              data: response.data.weeklyFormApprovals,
            },
            // Sheet 3: Response Time Trend
            {
              sheetName: "Response Time Trend",
              columns: [
                { key: "month", label: "Month", width: 15 },
                { key: "value", label: "Avg Response (hrs)", width: 20 },
              ],
              data: response.data.responseTimeTrend,
            },
            // Sheet 4: Form Type Breakdown (only if data exists)
            ...(response.data.formTypeBreakdown.length > 0
              ? [
                  {
                    sheetName: "Form Type Breakdown",
                    columns: [
                      { key: "label", label: "Form Type", width: 25 },
                      { key: "count", label: "Count", width: 15 },
                      { key: "percentage", label: "Percentage (%)", width: 18 },
                    ],
                    data: response.data.formTypeBreakdown,
                  },
                ]
              : []),
            // Sheet 5: Performance Summary
            {
              sheetName: "Performance Summary",
              columns: [
                { key: "metric", label: "Metric", width: 30 },
                { key: "value", label: "Value", width: 30 },
              ],
              data: performanceData,
            },
          ],
          fileNamePrefix: "user_reports_export",
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
        toast.success("Reports exported successfully");
      },
      // On error callback
      (errorMessage) => {
        setIsExporting(false);
        toast.error(errorMessage);
      }
    );
  };

  return {
    exportUserReports,
    isExporting,
  };
};
