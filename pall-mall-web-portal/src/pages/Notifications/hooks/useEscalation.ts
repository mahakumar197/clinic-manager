// // hooks/useEscalation.ts
// import { useCallback, useEffect, useState } from "react";
// import { EscalationRule, Pagination, DropdownType } from "@/services";
// import { escalationService } from "@/services/modules/ruleEscalation.service";
// import { dropdownsService } from "@/services/modules/dropdowns.service";

// /**
//  * Filters supported by Escalation Rules API
//  */
// export interface EscalationFilters {
//   search?: string;
//   is_active?: boolean;
//   base_trigger_event?: number;
//   condition?: number;
//   action?: number;
// }

// type SortQuery = Record<string, 1 | -1>;

// export const useEscalation = () => {
//   /* ----------------------------------
//    * Data state
//    * ---------------------------------- */
//   const [rawRules, setRawRules] = useState<EscalationRule[]>([]);
//   const [total, setTotal] = useState<number>(0);
//   const [pagination, setPagination] = useState<Pagination>({
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 0,
//     hasNext: false,
//     hasPrev: false,
//   });

//   /* ----------------------------------
//    * UI state
//    * ---------------------------------- */
//   const [filters, setFilters] = useState<EscalationFilters>({});
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [sort, setSort] = useState<SortQuery>({});

//   /* ----------------------------------
//    * Toggle state - tracks which rules are being toggled
//    * ---------------------------------- */
//   const [toggling, setToggling] = useState<Record<string, boolean>>({});

//   /* ----------------------------------
//    * Dropdown label maps
//    * ---------------------------------- */
//   const [conditionMap, setConditionMap] = useState<Record<number, string>>({});
//   const [actionMap, setActionMap] = useState<Record<number, string>>({});

//   /* ----------------------------------
//    * Load dropdown labels ONCE
//    * ---------------------------------- */
//   useEffect(() => {
//     const loadDropdowns = async () => {
//       try {
//         const [conditions, actions] = await Promise.all([
//           dropdownsService.getDropdown(DropdownType.ESCALATION_CONDITION),
//           dropdownsService.getDropdown(DropdownType.ESCALATION_TYPE),
//         ]);

//         setConditionMap(
//           Object.fromEntries(conditions.map((c) => [c.value, c.label]))
//         );

//         setActionMap(
//           Object.fromEntries(actions.map((a) => [a.value, a.label]))
//         );
//       } catch (e) {
//         console.error("Failed to load escalation dropdowns", e);
//       }
//     };

//     loadDropdowns();
//   }, []);

//   /* ----------------------------------
//    * Fetch escalation rules
//    * ---------------------------------- */
//   const fetchEscalationRules = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await escalationService.getEscalationRules({
//         page: pagination.page,
//         limit: pagination.limit,
//         ...filters,
//         ...sort,
//       });

//       setRawRules(response.rules);
//       setTotal(response.total);
//       setPagination(response.pagination);
//     } catch (err: any) {
//       setError(err?.message || "Failed to load escalation rules");
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, filters, sort]);

//   /* ----------------------------------
//    * Auto fetch
//    * ---------------------------------- */
//   useEffect(() => {
//     fetchEscalationRules();
//   }, [fetchEscalationRules]);

//   /* ----------------------------------
//    * Toggle rule status - with optimistic update
//    * ---------------------------------- */
//   const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
//     const newStatus = !currentStatus;

//     // Mark as toggling
//     setToggling((prev) => ({ ...prev, [ruleId]: true }));

//     // Optimistic update
//     setRawRules((prevRules) =>
//       prevRules.map((rule) =>
//         rule.id === ruleId ? { ...rule, is_active: newStatus } : rule
//       )
//     );

//     try {
//       await escalationService.toggleNotificationRuleStatus(ruleId, newStatus);
//     } catch (error) {
//       // Revert on error
//       setRawRules((prevRules) =>
//         prevRules.map((rule) =>
//           rule.id === ruleId ? { ...rule, is_active: currentStatus } : rule
//         )
//       );
//       throw error;
//     } finally {
//       setToggling((prev) => ({ ...prev, [ruleId]: false }));
//     }
//   };

//   /* ----------------------------------
//    * Enrich rules with labels (computed on render)
//    * ---------------------------------- */
//   const rules = rawRules.map((rule: any) => ({
//     ...rule,
//     condition_label: conditionMap[rule.condition],
//     action_label: actionMap[rule.action],
//   }));

//   /* ----------------------------------
//    * Public helpers
//    * ---------------------------------- */
//   const updateFilters = (newFilters: Partial<EscalationFilters>) => {
//     setPagination((prev) => ({ ...prev, page: 1 }));
//     setFilters((prev) => ({ ...prev, ...newFilters }));
//   };

//   const updateSort = (sortQuery: SortQuery) => {
//     setPagination((prev) => ({ ...prev, page: 1 }));
//     setSort(sortQuery);
//   };

//   const changePage = (page: number) => {
//     setPagination((prev) => ({ ...prev, page }));
//   };

//   const changeLimit = (limit: number) => {
//     setPagination((prev) => ({ ...prev, page: 1, limit }));
//   };

//   const refresh = () => {
//     fetchEscalationRules();
//   };

//   return {
//     rules,
//     total,
//     pagination,
//     loading,
//     error,
//     updateFilters,
//     updateSort,
//     changePage,
//     changeLimit,
//     refresh,
//     toggleRuleStatus,
//     toggling,
//   };
// };








// hooks/useEscalation.ts
import { useCallback, useEffect, useState } from "react";
import { EscalationRule, Pagination, DropdownType } from "@/services";
import { escalationService } from "@/services/modules/ruleEscalation.service";
import { dropdownsService } from "@/services/modules/dropdowns.service";

/**
 * Filters supported by Escalation Rules API
 */
export interface EscalationFilters {
  search?: string;
  is_active?: boolean;
  base_trigger_event?: number;
  condition?: number;
  action?: number;
}

type SortQuery = Record<string, 1 | -1>;

export const useEscalation = () => {
  /* ----------------------------------
   * Data state
   * ---------------------------------- */
  const [rawRules, setRawRules] = useState<EscalationRule[]>([]);
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
  const [filters, setFilters] = useState<EscalationFilters>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortQuery>({});

  /* ----------------------------------
   * Toggle state - tracks which rules are being toggled
   * ---------------------------------- */
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  /* ----------------------------------
   * Dropdown label maps
   * ---------------------------------- */
  const [conditionMap, setConditionMap] = useState<Record<number, string>>({});
  const [actionMap, setActionMap] = useState<Record<number, string>>({});

  /* ----------------------------------
   * Load dropdown labels ONCE
   * ---------------------------------- */
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [conditions, actions] = await Promise.all([
          dropdownsService.getDropdown(DropdownType.ESCALATION_CONDITION),
          dropdownsService.getDropdown(DropdownType.ESCALATION_TYPE),
        ]);

        setConditionMap(
          Object.fromEntries(conditions.map((c) => [c.value, c.label]))
        );

        setActionMap(
          Object.fromEntries(actions.map((a) => [a.value, a.label]))
        );
      } catch (e) {
        console.error("Failed to load escalation dropdowns", e);
      }
    };

    loadDropdowns();
  }, []);

  /* ----------------------------------
   * Fetch escalation rules
   * ---------------------------------- */
  const fetchEscalationRules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await escalationService.getEscalationRules({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...sort,
      });

      setRawRules(response.rules);
      setTotal(response.total);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err?.message || "Failed to load escalation rules");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, sort]);

  /* ----------------------------------
   * Auto fetch
   * ---------------------------------- */
  useEffect(() => {
    fetchEscalationRules();
  }, [fetchEscalationRules]);

  /* ----------------------------------
   * Toggle rule status - with optimistic update
   * ---------------------------------- */
  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Mark as toggling
    setToggling((prev) => ({ ...prev, [ruleId]: true }));

    // Optimistic update
    setRawRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === ruleId ? { ...rule, is_active: newStatus } : rule
      )
    );

    try {
      await escalationService.toggleNotificationRuleStatus(ruleId, newStatus);
    } catch (error) {
      // Revert on error
      setRawRules((prevRules) =>
        prevRules.map((rule) =>
          rule.id === ruleId ? { ...rule, is_active: currentStatus } : rule
        )
      );
      throw error;
    } finally {
      setToggling((prev) => ({ ...prev, [ruleId]: false }));
    }
  };

  /* ----------------------------------
   * Enrich rules with labels (computed on render)
   * Uses API labels as primary source, dropdown maps as fallback
   * ---------------------------------- */
  const rules = rawRules.map((rule: any) => ({
    ...rule,
    condition_label: rule.condition_label || conditionMap[rule.condition] || 'Unknown Condition',
    action_label: rule.action_label || actionMap[rule.action] || 'Unknown Action',
  }));

  /* ----------------------------------
   * Public helpers
   * ---------------------------------- */
  const updateFilters = (newFilters: Partial<EscalationFilters>) => {
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
    fetchEscalationRules();
  };

  return {
    rules,
    total,
    pagination,
    loading,
    error,
    updateFilters,
    updateSort,
    changePage,
    changeLimit,
    refresh,
    toggleRuleStatus,
    toggling,
  };
};