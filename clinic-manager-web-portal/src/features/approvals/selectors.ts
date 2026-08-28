import { RootState } from "@/app/store";

export const selectApprovals = (state: RootState) =>
  state.approvals.approvals;

export const selectSelectedApproval = (state: RootState) => {
  const { approvals, selectedId } = state.approvals;
  return approvals.find((item) => item.id === selectedId) || null;
};

export const selectViewMode = (state: RootState) =>
  state.approvals.viewMode;
