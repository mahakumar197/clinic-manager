import { useState, useEffect } from "react";
import { notificationService } from "@/services/modules/ruleNotification.service";
import { escalationService } from "@/services/modules/ruleEscalation.service";
import {
  dropdownsService,
  DropdownApiItem,
} from "@/services/modules/dropdowns.service";
import { DropdownType } from "@/services";
import { CreateRuleFormValues } from "../admin/CreateRule/Schemas";

export const useCreateRule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleTypeMap, setRoleTypeMap] = useState<Record<string, string>>({});
  const [escalationConditionMap, setEscalationConditionMap] = useState<
    Record<string, string>
  >({});
  const [escalationActionMap, setEscalationActionMap] = useState<
    Record<string, string>
  >({});
  const [triggerEventMap, setTriggerEventMap] = useState<
    Record<string, string>
  >({});
  const [isRoleTypesLoaded, setIsRoleTypesLoaded] = useState(false);
  const [isDropdownsLoaded, setIsDropdownsLoaded] = useState(false);

  // Fetch all dropdown data on mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [roleTypes, conditions, actions, events] = await Promise.all([
          dropdownsService.getDropdown(DropdownType.ROLE_TYPE),
          dropdownsService.getDropdown(DropdownType.ESCALATION_CONDITION),
          dropdownsService.getDropdown(DropdownType.ESCALATION_TYPE),
          dropdownsService.getDropdown(DropdownType.TRIGGER_EVENT),
        ]);

        if (roleTypes) {
          const roleMap: Record<string, string> = {};
          roleTypes.forEach((role) => {
            roleMap[role.id.toString()] = role.beValue.toUpperCase();
          });

          setRoleTypeMap(roleMap);
          setIsRoleTypesLoaded(true);
        }

        if (conditions) {
          const conditionMap: Record<string, string> = {};
          conditions.forEach((item: DropdownApiItem) => {
            conditionMap[item.id.toString()] = item.beValue;
          });
          setEscalationConditionMap(conditionMap);
        }

        if (actions) {
          const actionMap: Record<string, string> = {};
          actions.forEach((item: DropdownApiItem) => {
            actionMap[item.id.toString()] = item.beValue;
          });
          setEscalationActionMap(actionMap);
        }

        if (events) {
          const eventMap: Record<string, string> = {};
          events.forEach((item: DropdownApiItem) => {
            eventMap[item.id.toString()] = item.beValue;
          });
          setTriggerEventMap(eventMap);
        }

        setIsDropdownsLoaded(true);
      } catch (err) {
        setIsRoleTypesLoaded(true);
        setIsDropdownsLoaded(true);
      }
    };

    fetchDropdowns();
  }, []);

  const createRule = async (formData: CreateRuleFormValues) => {
    setLoading(true);
    setError(null);

    try {
      if (!isRoleTypesLoaded) {
        throw new Error("Role types are still loading. Please try again.");
      }

      // FIXED: strong union type
      const channels: ("IN_APP" | "EMAIL" | "DIGEST")[] = [];
      if (formData.channelInApp) channels.push("IN_APP");
      if (formData.channelEmail) channels.push("EMAIL");
      if (formData.channelDigest) channels.push("DIGEST");

      // IDs (for escalation)
      const roleIds = formData.recipients.map((id) => parseInt(id));

      // KEYS (for notification)
      const roleKeys = formData.recipients.map((id) => roleTypeMap[id]);

      if (formData.ruleType === "notification") {
        const payload = {
          name: formData.ruleName,
          triggerEvent: formData.triggerEvent!,
          channels,
          recipients: {
            roles: roleIds, // string[]
            users: [],
            assignedTo: true,
          },
        };

        await notificationService.createNotificationRule(payload);
      } else {
        const payload = {
          name: formData.ruleName,
          baseTriggerEvent: 66,
          condition: formData.escalationCondition!,
          action: formData.escalationAction!,
          channels,
          recipients: {
            roles: roleIds, // number[]
            users: [],
            assignedTo: true,
          },
        };

        await escalationService.createEscalationRule(payload);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to create rule";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
  };

  const getConditionLabel = (id: number | string) => {
    return escalationConditionMap[id.toString()] || `${id}`;
  };

  const getActionLabel = (id: number | string) => {
    return escalationActionMap[id.toString()] || `${id}`;
  };

  const getEventLabel = (id: number | string) => {
    return triggerEventMap[id.toString()] || `${id}`;
  };

  return {
    createRule,
    loading,
    error,
    reset,
    isRoleTypesLoaded,
    isDropdownsLoaded,
    roleTypeMap,
    escalationConditionMap,
    escalationActionMap,
    triggerEventMap,
    getConditionLabel,
    getActionLabel,
    getEventLabel,
  };
};
