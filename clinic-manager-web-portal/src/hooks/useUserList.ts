import { useCallback, useMemo } from "react";
import authService from "@/services/modules/auth.service";
import { UserListItem } from "@/services";
import { useListData } from "@/hooks";

interface UseUserListParams {
  roleType?: string;   // include only this role
  exclude?: string;    // comma-separated roles
  search?: string;     // backend search key
}

export const useUserList = (params: UseUserListParams = {}) => {
  const { roleType, exclude, search } = params;

  const fetchParams = useMemo(
    () => ({ roleType, exclude, search }),
    [roleType, exclude, search],
  );

  const fetcher = useCallback(
    async (p: typeof fetchParams, signal: AbortSignal) => {
      const data = await authService.getUsersByRole(p, signal);
      return (data ?? []) as UserListItem[];
    },
    [],
  );

  const { data, initialLoading, isFetching, error, refresh } = useListData({
    fetcher,
    params: fetchParams,
    debounceKeys: ["search"],
    debounceMs: 400,
  });

  return {
    users: data ?? [],
    loading: initialLoading,   // skeleton (first load only)
    isFetching,                // progress / subtle indicator
    error,
    refetch: refresh,
  };
};
