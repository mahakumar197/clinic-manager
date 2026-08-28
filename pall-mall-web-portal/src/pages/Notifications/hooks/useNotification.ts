import { useCallback, useEffect, useState } from "react";
import { NotificationRule, Pagination } from "@/services";
import { notificationService } from "@/services/modules/ruleNotification.service";

/**
 * Filters supported by Notification Rules API
 */
export interface NotificationFilters {
  search?: string;
  is_active?: boolean;
  trigger_event?: number;
}

type SortQuery = Record<string, 1 | -1>;

/**
 * UI-enriched rule
 */
export interface EnrichedNotificationRule extends NotificationRule {
  trigger_event_label_ui: string;
  role_labels_ui: string[];
}

export const useNotification = () => {
  /* ----------------------------------
   * Data state
   * ---------------------------------- */
  const [rules, setRules] = useState<EnrichedNotificationRule[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  /* ----------------------------------
   * UI state
   * ---------------------------------- */
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortQuery>({});

  /* ----------------------------------
   * Toggle status state (per rule)
   * ---------------------------------- */
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  /* ----------------------------------
   * Helpers
   * ---------------------------------- */
  const formatRoleName = (role: any) => {
    // Handle non-string values (objects, numbers, etc.)
    if (typeof role !== 'string') {
      // If it's an object with a name or label property, use that
      if (role?.name) return role.name;
      if (role?.label) return role.label;
      // Otherwise convert to string
      role = String(role);
    }
    
    return role
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  /* ----------------------------------
   * Fetch notification rules
   * ---------------------------------- */
  const fetchNotificationRules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotificationRules({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...sort,
      });

      console.log("📡 useNotification - API Response:", response);
      console.log("📡 useNotification - response.rules:", response.rules);
      console.log("📡 useNotification - response.total:", response.total);

      const enrichedRules: EnrichedNotificationRule[] =
        response.rules.map((rule: any) => ({
          ...rule,
          trigger_event_label_ui: rule.trigger_event_label,
          role_labels_ui: rule.recipients?.roles?.map(formatRoleName) || [],
        }));

      console.log("✨ useNotification - enrichedRules:", enrichedRules);

      setRules(enrichedRules);
      setTotal(response.total);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error("❌ useNotification - Error:", err);
      setError(err?.message || "Failed to load notification rules");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, sort]);

  /* ----------------------------------
   * Auto fetch on mount / dependency change
   * ---------------------------------- */
  useEffect(() => {
    fetchNotificationRules();
  }, [fetchNotificationRules]);

  /* ----------------------------------
   * Toggle notification rule status
   * (same API as EditNotificationForm)
   * ---------------------------------- */
  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    setToggling((prev) => ({ ...prev, [ruleId]: true }));

    try {
      const newStatus = !currentStatus;

      // Call backend API
      await notificationService.toggleNotificationRuleStatus(ruleId, newStatus);

      // Optimistic UI update
      setRules((prevRules) =>
        prevRules.map((rule) =>
          rule.id === ruleId ? { ...rule, is_active: newStatus } : rule
        )
      );
    } catch (err: any) {
      setError(err?.message || "Failed to toggle notification rule status");
      console.error("Toggle status error:", err);

      // Re-fetch to resync in case of error
      await fetchNotificationRules();
    } finally {
      setToggling((prev) => ({ ...prev, [ruleId]: false }));
    }
  };

  /* ----------------------------------
   * Public helpers for filters & pagination
   * ---------------------------------- */
  const updateFilters = (newFilters: Partial<NotificationFilters>) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const updateSort = (sortQuery: SortQuery) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSort(sortQuery);
  };

  const changePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const changeLimit = (limit: number) => {
    setPagination((prev) => ({ ...prev, page: 1, limit }));
  };

  const refresh = () => {
    fetchNotificationRules();
  };

  return {
    rules,
    total,
    pagination,
    loading,
    error,

    // status helpers
    toggling,
    toggleRuleStatus,

    // filters & pagination
    updateFilters,
    updateSort,
    changePage,
    changeLimit,
    refresh,
  };
};
