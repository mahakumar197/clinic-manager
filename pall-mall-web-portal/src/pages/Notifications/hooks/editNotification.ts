import { useCallback, useEffect, useState } from "react";
import {
  NotificationRuleDetailsResponse,
  UpdateNotificationRulePayload,
} from "@/services";
import { notificationService } from "@/services/modules/ruleNotification.service";

/**
 * useNotificationRule hook
 * -------------------------------------------------
 * Responsible for:
 * - fetching notification rule by id
 * - updating notification rule
 * - updating notification rule status
 * - deleting notification rule
 * - handling loading & error states
 */
export const useNotificationRule = (ruleId?: string) => {
  /* ----------------------------------
   * Data state
   * ---------------------------------- */
  const [rule, setRule] = useState<
    NotificationRuleDetailsResponse["rule"] | null
  >(null);

  /* ----------------------------------
   * UI state
   * ---------------------------------- */
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------
   * Fetch notification rule by ID
   * ---------------------------------- */
  const fetchNotificationRule = useCallback(async () => {
    if (!ruleId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotificationRuleById(
        ruleId
      );

      setRule(response.rule);
    } catch (err: any) {
      setError(err?.message || "Failed to load notification rule");
    } finally {
      setLoading(false);
    }
  }, [ruleId]);

  /* ----------------------------------
   * Auto fetch on ruleId change
   * ---------------------------------- */
  useEffect(() => {
    fetchNotificationRule();
  }, [fetchNotificationRule]);

  /* ----------------------------------
   * Update notification rule
   * ---------------------------------- */
  const updateNotificationRule = async (
    payload: UpdateNotificationRulePayload
  ) => {
    if (!ruleId) return;

    setUpdating(true);
    setError(null);

    try {
      const response = await notificationService.updateNotificationRule(
        ruleId,
        payload
      );

      // optimistic update
      setRule(
        (prev) =>
          ({
            ...prev,
            ...payload,
          } as any)
      );

      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to update notification rule");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  /* ----------------------------------
   * TOGGLE RULE STATUS
   * ---------------------------------- */
  const toggleRuleStatus = async (isActive: boolean) => {
    if (!ruleId) return;

    setStatusUpdating(true);
    setError(null);

    try {
      const response = await notificationService.toggleNotificationRuleStatus(
        ruleId,
        isActive
      );

      // optimistic update
      setRule((prev) => (prev ? { ...prev, is_active: isActive } : prev));

      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to update rule status");
      throw err;
    } finally {
      setStatusUpdating(false);
    }
  };

  /* ----------------------------------
   * DELETE NOTIFICATION RULE
   * ---------------------------------- */
  const deleteNotificationRule = async () => {
    if (!ruleId) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await notificationService.deleteNotificationRule(ruleId);

      // Clear the rule after successful deletion
      setRule(null);

      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to delete notification rule");
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  /* ----------------------------------
   * Manual refresh
   * ---------------------------------- */
  const refresh = () => {
    fetchNotificationRule();
  };

  /* ----------------------------------
   * Exposed API
   * ---------------------------------- */
  return {
    // data
    rule,

    // state
    loading,
    updating,
    statusUpdating,
    deleting, 
    error,

    // actions
    refresh,
    updateNotificationRule,
    toggleRuleStatus,
    deleteNotificationRule, 
  };
};
