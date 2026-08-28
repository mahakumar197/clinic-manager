import { useEffect, useState, useCallback, useRef } from "react";
import reportsService from "@/services/modules/reports.service";
import { toast } from "@/utils/toast";
import axios from "axios";

interface DashboardCard {
  id: number;
  title: string;
  value: string | number;
  iconName: string;
  variant: string;
  subtitle: string;
}

interface WeeklyApprovalsChart {
  data: Array<{
    month: string;
    approved: number;
  }>;
  labels: {
    approved: string;
  };
  colors: {
    approved: string;
  };
}

interface ResponseTimeTrendChart {
  data: Array<{
    month: string;
    value: number;
  }>;
  labels: {
    value: string;
  };
  colors: {
    value: string;
  };
}

interface FormTypeProgress {
  label: string;
  value: number;
  count: number;
  color: string;
  showDot: boolean;
}

interface PerformanceProgress {
  label: string;
  value: number;
  subLabel: string;
  outstandingPerformance?: boolean;
}

interface UserReportsData {
  cards: DashboardCard[];
  weeklyApprovals: WeeklyApprovalsChart;
  responseTimeTrend: ResponseTimeTrendChart;
  formTypes: FormTypeProgress[];
  performanceSummary: PerformanceProgress[];
  performanceMessage: {
    title: string;
    description: string;
  };
}

interface UseUserReportsParams {
  filter?: string;
  startDate?: string;
  endDate?: string;
}

interface UseUserReportsResult {
  reportsData: UserReportsData | null;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch user/personal reports dashboard data
 * @param params - Optional date filter parameters
 */
export const useUserReports = (
  params?: UseUserReportsParams
): UseUserReportsResult => {
  const [reportsData, setReportsData] = useState<UserReportsData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const fetchReports = useCallback(async () => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsFetching(true);
    setError(null);

    try {
      const response = await reportsService.getUserReports(
        params?.filter,
        params?.startDate,
        params?.endDate,
        controller.signal
      );

      // Transform cards
      const cards: DashboardCard[] = [
        {
          id: 1,
          title: "Total Approvals",
          value: response.data.cards.totalTaskCount.count,
          iconName: "CircleCheck",
          variant: "orange",
          subtitle:
            response.data.cards.totalTaskCount.change !== 0
              ? `+${response.data.cards.totalTaskCount.change}% vs last month`
              : "No change",
        },
        {
          id: 2,
          title: "This Week",
          value: response.data.cards.weekTaskCount.count,
          iconName: "Calendar",
          variant: "blue",
          subtitle:
            response.data.cards.weekTaskCount.change !== 0
              ? `+${response.data.cards.weekTaskCount.change}% vs last week`
              : "No change",
        },
        {
          id: 3,
          title: "Avg Response Time",
          value: `${response.data.cards.avgResponse.avgResponseTimeInHours.toFixed(1)}h`,
          iconName: "Clock",
          variant: "red",
          subtitle:
            response.data.cards.avgResponse.avgResponseChange !== 0
              ? `${response.data.cards.avgResponse.avgResponseChange > 0 ? "+" : ""}${response.data.cards.avgResponse.avgResponseChange}% improvement`
              : "No change",
        },
        {
          id: 4,
          title: "Outstanding Forms",
          value: response.data.cards.formSubmissions,
          iconName: "FileText",
          variant: "green",
          subtitle: "Awaiting review",
        },
      ];

      // Transform weekly approvals
      const weeklyApprovals: WeeklyApprovalsChart = {
        data: response.data.weeklyApprovals.map((item) => ({
          month: capitalizeFirstLetter(item.day.substring(0, 3)),
          approved: item.count,
        })),
        labels: {
          approved: "Forms Approved",
        },
        colors: {
          approved: "#E9A708",
        },
      };

      // Transform response time trend
      const responseTimeTrend: ResponseTimeTrendChart = {
        data: response.data.responseTimeTrend.map((item) => ({
          month: capitalizeFirstLetter(item.month),
          value: item.value,
        })),
        labels: {
          value: "Response Time (hrs)",
        },
        colors: {
          value: "#E9A708",
        },
      };

      // Transform form types breakdown
      const formTypes: FormTypeProgress[] = response.data.formTypeBreakdown.map((item, index) => {
        const colors = ["primary.main", "#00C950", "#3B82F6"];
        return {
          label: item.formType,
          value: item.percentage,
          count: item.count,
          color: colors[index % colors.length],
          showDot: true,
        };
      });

      // Transform performance summary
      const performanceSummary: PerformanceProgress[] = [
        {
          label: "Completion Rate",
          value: response.data.performanceSummary.completionRate,
          subLabel: response.data.performanceSummary.comparisonText,
          outstandingPerformance: response.data.performanceSummary.outstandingPerformance,
        },
        {
          label: "Quality Score",
          value: response.data.performanceSummary.qualityScore,
          subLabel: response.data.performanceSummary.qualityLabel,
        },
      ];

      // Performance message
      const performanceMessage = {
        title: "Outstanding Performance",
        description: `${response.data.performanceSummary.comparisonText}. ${response.data.performanceSummary.qualityLabel}.`,
      };

      setReportsData({
        cards,
        weeklyApprovals,
        responseTimeTrend,
        formTypes,
        performanceSummary,
        performanceMessage,
      });
    } catch (err: any) {
      if (axios.isCancel(err) || err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("Failed to fetch user reports", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load user reports";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (!controller.signal.aborted) {
        setIsFetching(false);
        setInitialLoading(false);
      }
    }
  }, [params?.filter, params?.startDate, params?.endDate]);

  useEffect(() => {
    fetchReports();
    return () => { abortControllerRef.current?.abort(); };
  }, [fetchReports]);

  return {
    reportsData,
    loading: initialLoading,
    isFetching,
    error,
    refetch: fetchReports,
  };
};
