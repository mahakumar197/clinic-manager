import { useEffect, useState, useCallback, useRef } from "react";
import reportsService from "@/services/modules/reports.service";
import { toast } from "@/utils/toast";
import axios from "axios";

interface PerformanceUser {
  id: number;
  name: string;
  role: string;
  tasks: number;
  response: string;
  satisfaction: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsePerformanceByUserParams {
  filter?: string;
  startDate?: string;
  endDate?: string;
}

interface UsePerformanceByUserResult {
  users: PerformanceUser[];
  pagination: Pagination;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  changePage: (page: number) => void;
  changeLimit: (limit: number) => void;
  refetch: () => void;
}

/**
 * Custom hook to manage performance by user data
 * Handles fetching user performance with pagination and date filtering
 * @param params - Optional date filter parameters
 */
export const usePerformanceByUser = (
  params?: UsePerformanceByUserParams
): UsePerformanceByUserResult => {
  const [users, setUsers] = useState<PerformanceUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPerformance = useCallback(async () => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsFetching(true);
    setError(null);

    try {
      const response = await reportsService.getPerformanceByUser(
        pagination.page,
        pagination.limit,
        params?.filter,
        params?.startDate,
        params?.endDate,
        controller.signal
      );

      // Transform performance data
      if (response.data && response.data.length > 0) {
        const performanceData = response.data[0].performance.map((user, index) => ({
          id: index + 1,
          name: user.userName,
          role: user.role,
          tasks: user.tasksCompleted,
          response: user.avgResponse,
          satisfaction: user.satisfaction,
        }));
        setUsers(performanceData);

        // Update pagination metadata
        setPagination({
          total: response.meta.pagination.total,
          totalPages: response.meta.pagination.totalPages,
          page: response.meta.pagination.page,
          limit: response.meta.pagination.limit,
        });
      }
    } catch (err: any) {
      if (axios.isCancel(err) || err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("Failed to fetch performance data", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load performance data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (!controller.signal.aborted) {
        setIsFetching(false);
        setInitialLoading(false);
      }
    }
  }, [pagination.page, pagination.limit, params?.filter, params?.startDate, params?.endDate]);

  useEffect(() => {
    fetchPerformance();
    return () => { abortControllerRef.current?.abort(); };
  }, [fetchPerformance]);

  /**
   * Change page
   */
  const changePage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  /**
   * Change page size
   */
  const changeLimit = (limit: number) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      limit,
    }));
  };

  return {
    users,
    pagination,
    loading: initialLoading,
    isFetching,
    error,
    changePage,
    changeLimit,
    refetch: fetchPerformance,
  };
};
