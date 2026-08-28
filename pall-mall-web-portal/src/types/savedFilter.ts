export type FilterModule = "TASKS" | "MESSAGES" | "PATIENTS" | "APPROVALS_FORM" | "STAFF_APPROVALS_FORM" | "APPROVALS_UPLOAD" | "STAFF_APPROVALS_UPLOAD";

export interface SavedFilter {
  id: string; // filterId
  type: FilterModule; // TASKS, etc
  filterName: string; // "Sarah – Pre Op"
  filterData: Record<string, any>; // actual query params
  createdAt: string;
  updatedAt: string;
}
