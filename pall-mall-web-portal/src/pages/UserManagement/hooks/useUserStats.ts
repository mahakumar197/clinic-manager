import { useEffect, useState, useCallback } from "react";
import userService from "@/services/modules/user.service";
import { UserManagementStats } from "@/services";
import { toast } from "@/utils/toast";

interface UseUserStatsResult {
  stats: UserManagementStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch user management dashboard statistics
 * Returns total users, active, 2FA enabled, and suspended counts
 */
export const useUserStats = (): UseUserStatsResult => {
  const [stats, setStats] = useState<UserManagementStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await userService.getUserManagementStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to fetch user management stats", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to load user statistics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
