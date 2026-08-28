import { useState } from "react";
import reportsService from "@/services/modules/reports.service";
import { toast } from "@/utils/toast";
import { handlePDFExport, PDFReportConfig, PDFTableConfig } from "@/utils/pdfExport";

/**
 * Report filters interface
 */
export interface ReportFilters {
  filter?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Map dashboard metric keys to readable labels
 */
const METRIC_LABELS: Record<string, string> = {
  conversionRate: "Conversion Rate",
  averageResponse: "Average Response Time",
};

/**
 * Transform admin reports API response into PDF report configuration
 * This is admin-specific PDF generation logic
 */
export const generateAdminReportsPDF = (
  apiResponse: any,
  filters?: ReportFilters
): PDFReportConfig => {
  const { data } = apiResponse;

  // Validate response structure
  if (!data || typeof data !== "object") {
    throw new Error("Invalid response structure");
  }

  const {
    dashboardCard = [],
    appEngagement = [],
    contentPerformance = [],
    headcount = [],
    performance = [],
  } = data;

  // Build table configurations
  const tables: PDFTableConfig[] = [];

  // Table 1: Summary Metrics
  if (dashboardCard && dashboardCard.length > 0) {
    tables.push({
      title: "Summary Metrics",
      columns: [
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
        { key: "change", label: "Change" },
      ],
      data: dashboardCard.map((item: any) => {
        const label = METRIC_LABELS[item.key] || item.key;
        let value = "";
        let change = "";

        if (item.key === "conversionRate") {
          value = `${item.percentage ?? 0}%`;
          change = `${item.change >= 0 ? "+" : ""}${item.change}%`;
        } else if (item.key === "averageResponse") {
          value = `${item.avgHours ?? 0}h`;
          change = `${item.change >= 0 ? "+" : ""}${item.change}h`;
        }

        return { metric: label, value, change };
      }),
    });
  }

  // Table 2: App Engagement Trends
  if (appEngagement && appEngagement.length > 0) {
    tables.push({
      title: "App Engagement Trends",
      columns: [
        { key: "month", label: "Month" },
        { key: "activeuser", label: "Active Users" },
        { key: "guestuser", label: "Guest Users" },
      ],
      data: appEngagement,
    });
  }

  // Table 3: Content Performance
  if (contentPerformance && contentPerformance.length > 0) {
    tables.push({
      title: "Content Performance",
      columns: [
        { key: "label", label: "Content Type" },
        { key: "totalViews", label: "Total Views" },
        { 
          key: "engagement", 
          label: "Engagement %",
          formatter: (value) => `${value}%`
        },
      ],
      data: contentPerformance,
    });
  }

  // Table 4: Headcount Distribution
  if (headcount && headcount.length > 0) {
    tables.push({
      title: "Headcount Distribution",
      columns: [
        { key: "role", label: "Role" },
        { 
          key: "percentage", 
          label: "Percentage",
          formatter: (value) => `${value}%`
        },
      ],
      data: headcount,
    });
  }

  // Table 5: Performance by User (multi-page support)
  if (performance && performance.length > 0) {
    tables.push({
      title: "Performance by User",
      columns: [
        { key: "userName", label: "User Name" },
        { key: "role", label: "Role" },
        { key: "tasksCompleted", label: "Tasks Completed" },
        { key: "avgResponse", label: "Avg Response" },
        { key: "satisfaction", label: "Satisfaction" },
      ],
      data: performance,
      showHeadEveryPage: true, // Repeat headers on multi-page tables
    });
  }

  // Ensure we have at least one table
  if (tables.length === 0) {
    throw new Error("No data available to generate PDF");
  }

  return {
    reportTitle: "Reporting & Analytics",
    fileNamePrefix: "admin_reports",
    tables,
    filters,
  };
};

/**
 * Custom hook for exporting admin reports as PDF
 */
export const useAdminReportsPDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export admin reports as PDF
   */
  const exportAdminReportsPDF = async (filters: ReportFilters = {}) => {
    if (isExporting) return;

    await handlePDFExport(
      // API call that returns PDF config
      async () => {
        const payload: any = {};

        if (filters.filter) {
          payload.filter = filters.filter;
        }

        if (filters.startDate && filters.endDate) {
          payload.startDate = filters.startDate;
          payload.endDate = filters.endDate;
        }

        const response = await reportsService.exportAdminReports(payload);
        return generateAdminReportsPDF(response, filters);
      },
      // onStart
      () => setIsExporting(true),
      // onSuccess
      () => {
        setIsExporting(false);
        toast.success("PDF report generated successfully");
      },
      // onError
      (errorMessage) => {
        setIsExporting(false);
        toast.error(errorMessage);
      }
    );
  };

  return {
    exportAdminReportsPDF,
    isExporting,
  };
};
