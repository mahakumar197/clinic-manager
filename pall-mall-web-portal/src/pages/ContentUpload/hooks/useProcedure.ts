import { useCallback, useMemo, useState } from "react";
import { contentService } from "@/services/modules/content.service";
import { Procedure, ProcedureStatusCounts, Pagination } from "@/services";
import { useListData } from "@/hooks";

/* ----------------------------------
 * Filters supported by Procedure API
 * ---------------------------------- */
export interface ProcedureFilters {
  search?: string;
  type?: string;
}

/* ----------------------------------
 * Data shape returned by fetcher
 * ---------------------------------- */
interface ProcedureListData {
  procedures: Procedure[];
  statusCounts: ProcedureStatusCounts;
  pagination: Pagination;
}

/* ----------------------------------
 * useProcedure Hook
 * ---------------------------------- */
export const useProcedure = () => {
  /* ------------------------------
   * Pagination + filter state
   * ------------------------------ */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<ProcedureFilters>({});

  /* ------------------------------
   * Build params for useListData
   * ------------------------------ */
  const params = useMemo(() => ({
    page,
    limit,
    search: filters.search,
    type: filters.type,
  }), [page, limit, filters]);

  /* ------------------------------
   * Fetcher with AbortSignal
   * ------------------------------ */
  const fetcher = useCallback(
    async (p: typeof params, signal: AbortSignal): Promise<ProcedureListData> => {
      return contentService.getProcedures(p, signal);
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

  const procedures = data?.procedures ?? [];
  const statusCounts = data?.statusCounts ?? {
    draft: 0,
    published: 0,
    archived: 0,
    total: 0,
  };
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
  const updateFilters = (newFilters: Partial<ProcedureFilters>) => {
    setPage(1);
    setFilters((prev) => {
      const merged = { ...prev, ...newFilters };
      const cleaned = Object.fromEntries(
        Object.entries(merged).filter(
          ([_, v]) => v !== null && v !== undefined && v !== "" && v !== "All"
        )
      ) as ProcedureFilters;
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

  /* ------------------------------
   * Exposed API
   * ------------------------------ */
  return {
    // data
    procedures,
    statusCounts,
    pagination,

    // state
    loading: initialLoading,
    isFetching,
    error,

    // actions
    updateFilters,
    changePage,
    changeLimit,
    refresh,
  };
};
