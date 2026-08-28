
import { useCallback, useEffect, useState } from "react";
import {
  EscalationRuleDetailsResponse,
  UpdateEscalationRulePayload,
} from "@/services";
import { escalationService } from "@/services/modules/ruleEscalation.service";

/**
 * useEscalationRule hook
 * -------------------------------------------------
 * Responsible for:
 * - fetching escalation rule by id
 * - updating escalation rule
 * - toggling rule status
 * - deleting escalation rule
 * - handling loading & error states
 */
export const useEscalationRule = (ruleId?: string) => {
  /* ----------------------------------
   * Data state
   * ---------------------------------- */
  const [rule, setRule] =
    useState<EscalationRuleDetailsResponse["rule"] | null>(null);

  /* ----------------------------------
   * UI state
   * ---------------------------------- */
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------
   * Fetch escalation rule by ID
   * ---------------------------------- */
  const fetchEscalationRule = useCallback(async () => {
    if (!ruleId) return;

    setLoading(true);
    setError(null);

    try {
      const response =
        await escalationService.getEscalationRuleById(ruleId);

      setRule(response.rule);
    } catch (err: any) {
      setError(err?.message || "Failed to load escalation rule");
    } finally {
      setLoading(false);
    }
  }, [ruleId]);

  /* ----------------------------------
   * Auto fetch on ruleId change
   * ---------------------------------- */
  useEffect(() => {
    fetchEscalationRule();
  }, [fetchEscalationRule]);

  /* ----------------------------------
   * Update escalation rule
   * ---------------------------------- */
  const updateEscalationRule = async (
    payload: UpdateEscalationRulePayload
  ) => {
    if (!ruleId) return;

    setUpdating(true);
    setError(null);

    try {
      const response =
        await escalationService.updateEscalationRule(ruleId, payload);

      // optimistic update (optional but recommended)
      setRule((prev) => ({
        ...prev,
        ...payload,
      }) as any);

      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to update escalation rule");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  /* ----------------------------------
   * Toggle rule status
   * ---------------------------------- */
  const toggleRuleStatus = async (isActive: boolean) => {
    if (!ruleId) return;

    setToggling(true);
    setError(null);

    try {
      const response = await escalationService.toggleNotificationRuleStatus(
        ruleId,
        isActive
      );

      // optimistic update
      setRule((prev) =>
        prev
          ? {
              ...prev,
              isActive,
            }
          : null
      );

      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to toggle rule status");
      throw err;
    } finally {
      setToggling(false);
    }
  };

  /* ----------------------------------
   * DELETE ESCALATION RULE
   * ---------------------------------- */
  const deleteEscalationRule = async () => {
    if (!ruleId) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await escalationService.deleteEscalationRule(ruleId);

      // Clear the rule after successful deletion
      setRule(null);

      return response;
    } catch (err: any) {
      setError(err?.message || "Failed to delete escalation rule");
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  /* ----------------------------------
   * Manual refresh
   * ---------------------------------- */
  const refresh = () => {
    fetchEscalationRule();
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
    toggling,
    deleting, 
    error,

    // actions
    refresh,
    updateEscalationRule,
    toggleRuleStatus,
    deleteEscalationRule, 
  };
};