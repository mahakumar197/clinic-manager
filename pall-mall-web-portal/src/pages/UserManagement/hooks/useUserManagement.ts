import { useCallback, useMemo, useState } from "react";
import userService from "@/services/modules/user.service";
import { UserListItem, UserListFilters, Pagination } from "@/services";
import { useListData } from "@/hooks";

/* ----------------------------------
 * Data shape returned by fetcher
 * ---------------------------------- */
interface UserListData {
  users: UserListItem[];
  pagination: Pagination;
}

interface UseUserManagementResult {
  users: UserListItem[];
  pagination: Pagination;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  updateFilters: (filters: Partial<UserListFilters>) => void;
  changePage: (page: number) => void;
  changeLimit: (limit: number) => void;
  refetch: () => void;
}

/**
 * Custom hook to manage user list
 * Handles fetching users with filters and pagination
 */
export const useUserManagement = (): UseUserManagementResult => {
  /* ------------------------------
   * Pagination + filter state
   * ------------------------------ */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<UserListFilters>({});

  /* ------------------------------
   * Build params for useListData
   * ------------------------------ */
  const params = useMemo(() => {
    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };
    if (filters.search) queryParams.search = filters.search;
    if (filters.role) queryParams.role = filters.role;
    if (filters.status) queryParams.status = filters.status;
    return queryParams;
  }, [page, limit, filters]);

  /* ------------------------------
   * Fetcher with AbortSignal
   * ------------------------------ */
  const fetcher = useCallback(
    async (p: typeof params, signal: AbortSignal): Promise<UserListData> => {
      return userService.getUserList(p, signal);
    },
    [],
  );

  /* ------------------------------
   * useListData — debounce, abort, keep-previous-data
   * ------------------------------ */
  const { data, initialLoading, isFetching, error, refresh } = useListData({
    fetcher,
    params,
    debounceKeys: ["search"],
    debounceMs: 400,
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  /* ------------------------------
   * Public helpers
   * ------------------------------ */
  const updateFilters = (newFilters: Partial<UserListFilters>) => {
    setPage(1);
    setFilters((prev) => {
      const merged = { ...prev, ...newFilters };
      const cleaned = Object.fromEntries(
        Object.entries(merged).filter(
          ([_, v]) => v !== null && v !== undefined && v !== "" && v !== "All"
        )
      ) as UserListFilters;
      return cleaned;
    });
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  const changeLimit = (newLimit: number) => {
    setPage(1);
    setLimit(newLimit);
  };

  return {
    users,
    pagination,
    loading: initialLoading,
    isFetching,
    error,
    updateFilters,
    changePage,
    changeLimit,
    refetch: refresh,
  };
};
