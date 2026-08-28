// hooks/useUserApprovals.ts
import { UserApprovalsCounts } from "@/services";
import { UserApprovalService } from "@/services/modules/userApproval.service";
import { useCallback, useMemo, useState } from "react";
import { useListData } from "@/hooks";

export interface ApprovalsFilters {
  search?: string;
  status?: string;
  date?: string | null;
  startDate?: string;
  endDate?: string;
  dateFilter?: string;
  statusFilter?: string;
}

interface UserApprovalsListData {
  approvals: any[];
  cardsCounts: UserApprovalsCounts;
}

export const useUserApprovals = () => {
  /* ----------------------------------
   * Selection & view state
   * ---------------------------------- */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ApprovalsFilters>({});

  /* ----------------------------------
   * Build params for useListData
   * ---------------------------------- */
  const params = useMemo(() => ({
    search: filters.search,
    status: filters.status,
    date: filters.date ?? undefined,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    dateFilter: filters?.dateFilter,
    statusFilter: filters?.statusFilter,
  }), [filters]);

  /* ----------------------------------
   * Fetcher with AbortSignal
   * ---------------------------------- */
  const fetcher = useCallback(
    async (p: typeof params, signal: AbortSignal): Promise<UserApprovalsListData> => {
      return UserApprovalService.getApprovals(p, signal);
    },
    [],
  );

  /* ----------------------------------
   * useListData — debounce, abort, keep-previous-data
   * ---------------------------------- */
  const { data, initialLoading, isFetching, error, refresh } = useListData({
    fetcher,
    params,
    debounceKeys: ["search"],
    debounceMs: 400,
  });

  const approvals = data?.approvals ?? [];
  const cardsCounts = data?.cardsCounts ?? {};

  const updateFilters = (newFilters: Partial<ApprovalsFilters>) => {
    setFilters((prev) => {
      const merged = { ...prev, ...newFilters };
      const cleaned = Object.fromEntries(
        Object.entries(merged).filter(
          ([_, v]) => v !== null && v !== undefined && v !== "" && v !== "All"
        )
      ) as ApprovalsFilters;
      return cleaned;
    });
  };

  return {
    approvals,
    cardsCounts,
    selectedId,
    loading: initialLoading,
    isFetching,
    error,

    /* filters */
    filters,
    updateFilters,

    /* actions */
    selectApproval: setSelectedId,
    clearSelection: () => setSelectedId(null),

    //  REQUIRED FOR APPROVE / REJECT FLOW
    refetch: refresh,
  };
};
