import { useEffect, useState } from "react";
import { adminApprovalsService } from "../../../../../services/modules/adminApprovals.service";
import { ApprovalDetails } from "../../../../../services/types";

export const useAdminApprovalsDetails = (id: string | null) => {
  const [details, setDetails] = useState<ApprovalDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await adminApprovalsService.getApprovalById(id);
      setDetails({
        ...response,
        patient: response.patient ?? null,
        assigned_to_user: response.assigned_to_user ?? null,
        form: response.form ?? null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  return { details, loading, refetch: fetchDetails };
};
