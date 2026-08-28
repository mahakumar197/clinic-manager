import { useEffect, useState, useCallback, useRef } from "react";
import reportsService from "@/services/modules/reports.service";
import { toast } from "@/utils/toast";
import axios from "axios";

interface DashboardData {
  cards: Array<{
    id: number;
    title: string;
    value: string;
    iconName: string;
    variant: string;
    subtitle: string;
  }>;
  contentPerformance: {
    data: Array<{
      type: string;
      views: number;
      engagement: number;
    }>;
    labels: {
      views: string;
      engagement: string;
    };
    colors: {
      views: string;
      engagement: string;
    };
  };
  headcounts: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  appEngagementTrend: {
    data: Array<{
      month: string;
      activeuser: number;
      guestuser: number;
    }>;
    labels: {
      activeuser: string;
      guestuser: string;
    };
    colors: {
      activeuser: string;
      guestuser: string;
    };
  };
}

interface UseReportsDashboardParams {
  filter?: string;
  startDate?: string;
  endDate?: string;
}

interface UseReportsDashboardResult {
  dashboardData: DashboardData | null;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch reports dashboard data
 * Returns dashboard cards, content performance, and headcounts
 * @param params - Optional date filter parameters
 */
export const useReportsDashboard = (
  params?: UseReportsDashboardParams
): UseReportsDashboardResult => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDashboard = useCallback(async () => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsFetching(true);
    setError(null);

    try {
      const response = await reportsService.getReportsDashboard(
        params?.filter,
        params?.startDate,
        params?.endDate,
        controller.signal
      );

      // Transform dashboard cards
      const cards = [
        {
          id: 1,
          title: "Conversion Rate",
          value: `${response.data.dashboardCards.conversionRate.percentage}%`,
          iconName: "Users",
          variant: "red",
          subtitle:
            response.data.dashboardCards.conversionRate.change !== 0
              ? `${response.data.dashboardCards.conversionRate.change > 0 ? "+" : ""}${response.data.dashboardCards.conversionRate.change}% vs last month`
              : "No change",
        },
        {
          id: 2,
          title: "Avg Response Time",
          value: `${response.data.dashboardCards.averageResponse.avgHours} hours`,
          iconName: "FileCheck",
          variant: "green",
          subtitle:
            response.data.dashboardCards.averageResponse.change !== 0
              ? `${response.data.dashboardCards.averageResponse.change > 0 ? "+" : ""}${response.data.dashboardCards.averageResponse.change}% change`
              : "No change",
        },
      ];

      // Transform content performance data
      const contentPerformance = {
        data: response.data.contentPerformance.map((item) => ({
          type: item.label,
          views: item.totalViews,
          engagement: item.engagement,
        })),
        labels: {
          views: "Total Views",
          engagement: "Engagement %",
        },
        colors: {
          views: "#E9A708",
          engagement: "#10B981",
        },
      };

      // Transform headcounts
      const ROLE_COLORS: Record<string, string> = {
        surgeon: "#fc15ed",
        nurse: "#C6005C",
        admin: "#8200DB",
        coordinator: "#008236",
        patient: "#F97316",
        doctor: "#E9A708",
      };

      const headcounts = response.data.headcount.map((item) => ({
          name: item.role,
          value: item.count,
          color: ROLE_COLORS[item.role.toLowerCase()] || "#62748E", 
        }));

      // Transform app engagement trend
      const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      const appEngagementTrend = {
        data: response.data.appEngagementTrend.map((item) => ({
          month: capitalizeFirstLetter(item.month),
          activeuser: item.activeuser,
          guestuser: item.guestuser,
        })),
        labels: {
          activeuser: "Active Users",
          guestuser: "Guest Users",
        },
        colors: {
          activeuser: "#E9A708",
          guestuser: "#3B82F6",
        },
      };

      setDashboardData({
        cards,
        contentPerformance,
        headcounts,
        appEngagementTrend,
      });
    } catch (err: any) {
      if (axios.isCancel(err) || err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("Failed to fetch dashboard data", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load dashboard data";
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
    fetchDashboard();
    return () => { abortControllerRef.current?.abort(); };
  }, [fetchDashboard]);

  return {
    dashboardData,
    loading: initialLoading,
    isFetching,
    error,
    refetch: fetchDashboard,
  };
};
