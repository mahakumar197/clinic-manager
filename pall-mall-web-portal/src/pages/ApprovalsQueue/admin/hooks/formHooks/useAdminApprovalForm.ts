import { adminApprovalsService } from "@/services/modules/adminApprovals.service";
import { ApprovalFormItem } from "@/services/types";
import { toast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

export const useAdminApprovalForm = (
  formId: string | null,
  submitted_by: string | null,
) => {
  const [form, setForm] = useState<ApprovalFormItem | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchForm = useCallback(async () => {
    if (!formId || !submitted_by) return;

    try {
      setLoading(true);
      const data = await adminApprovalsService.getApprovalForm(
        formId,
        submitted_by,
      );
      setForm(data);
    } catch {
      toast.error("Failed to load form");
    } finally {
      setLoading(false);
    }
  }, [formId, submitted_by]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  return {
    form,
    loading,
    refetch: fetchForm,
  };
};
