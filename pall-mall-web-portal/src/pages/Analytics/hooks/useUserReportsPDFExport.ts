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
 * Transform user reports API response into PDF report configuration
 * This is user-specific PDF generation logic
 */
export const generateUserReportsPDF = (
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
    weeklyFormApprovals = [],
    responseTimeTrend = [],
    formTypeBreakdown = [],
    performanceSummary = [],
  } = data;

  // Build table configurations
  const tables: PDFTableConfig[] = [];

  // Table 1: Dashboard Metrics (Cards)
  // We need to transform the card array into a table structure
  const metricsData = dashboardCard.map((item: any) => {
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
      default:
        metric = item.key;
        value = String(item.value ?? item.count ?? 0);
    }
    return { metric, value, change };
  });

  if (metricsData.length > 0) {
    tables.push({
      title: "Dashboard Metrics",
      columns: [
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
        { key: "change", label: "Change" },
      ],
      data: metricsData,
    });
  }

  // Table 2: Weekly Form Approvals
  if (weeklyFormApprovals.length > 0) {
    tables.push({
      title: "Weekly Approvals",
      columns: [
        { key: "day", label: "Day" },
        { key: "count", label: "Approvals" },
      ],
      data: weeklyFormApprovals.map((item: any) => ({
        ...item,
        day: item.day.charAt(0).toUpperCase() + item.day.slice(1), // Capitalize day
      })),
    });
  }

  // Table 3: Response Time Trend
  if (responseTimeTrend.length > 0) {
    tables.push({
      title: "Response Time Trend",
      columns: [
        { key: "month", label: "Month" },
        { key: "value", label: "Avg Response (hrs)" },
      ],
      data: responseTimeTrend.map((item: any) => ({
        ...item,
        month: item.month.charAt(0).toUpperCase() + item.month.slice(1), 
      })),
    });
  }

  // Table 4: Form Type Breakdown
  if (formTypeBreakdown.length > 0) {
    tables.push({
      title: "Form Type Breakdown",
      columns: [
        { key: "formType", label: "Form Type" },
        { key: "count", label: "Count" },
        { 
          key: "percentage", 
          label: "Percentage",
          formatter: (value) => `${value}%`
        },
      ],
      data: formTypeBreakdown,
    });
  }

  // Table 5: Performance Summary
  if (performanceSummary.length > 0) {
    // Transform key-value pairs into table rows
    // Based on the data structure provided in the prompt, performanceSummary is an array of objects
    // [ { key: "completionRate", value: 14 }, ... ]
    
    // We can map this directly
    const perfMap: Record<string, string> = {
      completionRate: "Completion Rate",
      teamAverage: "Team Average",
      comparisonText: "Comparison",
      qualityScore: "Quality Score",
      qualityLabel: "Quality Label",
      outstandingPerformance: "Outstanding Performance",
    };

    const perfData = performanceSummary.map((item: any) => {
      let displayValue = String(item.value);
      
      // Add % for rates/scores
      if (["completionRate", "teamAverage", "qualityScore"].includes(item.key)) {
        displayValue = `${item.value}%`;
      }
      
      // Handle boolean
      if (item.value === true) displayValue = "Yes";
      if (item.value === false) displayValue = "No";

      return {
        metric: perfMap[item.key] || item.key,
        value: displayValue,
      };
    });

    tables.push({
      title: "Performance Summary",
      columns: [
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
      ],
      data: perfData,
    });
  }

  // Ensure we have at least one table
  if (tables.length === 0) {
    throw new Error("No data available to generate PDF");
  }

  return {
    reportTitle: "User Performance Report",
    fileNamePrefix: "user_reports",
    tables,
    filters,
  };
};

/**
 * Custom hook for exporting user reports as PDF
 */
export const useUserReportsPDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export user reports as PDF
   */
  const exportUserReportsPDF = async (filters: ReportFilters = {}) => {
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

        const response = await reportsService.exportUserReports(payload);
        return generateUserReportsPDF(response, filters);
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
    exportUserReportsPDF,
    isExporting,
  };
};
