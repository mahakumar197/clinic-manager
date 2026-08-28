import { useCallback, useMemo, useState } from "react";
import { tasksService } from "@/services/modules/tasks.service";
import { Task, TaskStatusCounts, Pagination } from "@/services";
import { useListData } from "@/hooks";

/**
 * Filters supported by Tasks API
 */
export interface TasksFilters {
  search?: string;
  procedureType?: string;
  status?: string;
  phases?: string;
  dueDate?: string | null;
  startDate?: string;
  endDate?: string;
  dateFilter?: string;
}
type SortQuery = Record<string, 1 | -1>;

interface TasksListData {
  tasks: Task[];
  statusCounts: TaskStatusCounts;
  pagination: Pagination;
}

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

/**
 * useTasks hook
 * -------------------------------------------------
 * Responsible for:
 * - fetching tasks
 * - handling filters (with debounced search)
 * - handling pagination
 * - cancelling stale requests
 * - keeping previous data visible during refetch
 * - exposing clean API to UI
 */
export const useTasks = () => {
  /* ----------------------------------
   * UI state (controlled by the page)
   * ---------------------------------- */
  const [filters, setFilters] = useState<TasksFilters>({});
  const [sort, setSort] = useState<SortQuery>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  /* ----------------------------------
   * Build params object for useListData
   * ---------------------------------- */
  const params = useMemo(
    () => ({
      page,
      limit,
      ...filters,
      ...sort,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      dateFilter: filters?.dateFilter,
    }),
    [page, limit, filters, sort],
  );

  /* ----------------------------------
   * Fetcher: calls tasksService with AbortSignal
   * ---------------------------------- */
  const fetcher = useCallback(
    async (p: typeof params, signal: AbortSignal): Promise<TasksListData> => {
      return tasksService.getTasks(p, signal);
    },
    [],
  );

  /* ----------------------------------
   * useListData – handles debounce, abort, keep-previous-data
   * ---------------------------------- */
  const { data, initialLoading, isFetching, error, refresh } = useListData({
    fetcher,
    params,
    debounceKeys: ["search"],
    debounceMs: 400,
  });

  /* ----------------------------------
   * Derived data (with safe defaults)
   * ---------------------------------- */
  const tasks = data?.tasks ?? [];
  const statusCounts = data?.statusCounts ?? {};
  const pagination = data?.pagination ?? DEFAULT_PAGINATION;

  /* ----------------------------------
   * Public helpers for UI
   * ---------------------------------- */

  /**
   * Update filters and reset page
   */
  const updateFilters = (newFilters: Partial<TasksFilters>) => {
    // setPagination((prev) => ({
    //   ...prev,
    //   page: 1,
    // }));
setPage(1);
    // setFilters((prev) => ({
    //   ...prev,
    //   ...newFilters,
    // }));

    setFilters((prev) => {
    const merged = { ...prev, ...newFilters };

    
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(
        ([_, v]) => v !== null && v !== undefined && v !== "" && v !== "All"
      )
    ) as TasksFilters;

    return cleaned;
  });

  };

  // sort function
  const updateSort = (sortQuery: SortQuery) => {
    setPage(1);
    setSort(sortQuery);
  };

  /**
   * Change page
   */
  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  /**
   * Change page size
   */
  const changeLimit = (newLimit: number) => {
    setPage(1);
    setLimit(newLimit);
  };

  /* ----------------------------------
   * Exposed API
   * ---------------------------------- */
  return {
    // data
    tasks,
    statusCounts,
    pagination,

    // state
    loading: initialLoading,   // skeleton-worthy (first load only)
    isFetching,                 // for progress bar overlay
    error,

    // actions
    updateFilters,
    updateSort,
    changePage,
    changeLimit,
    refresh,
  };
};
