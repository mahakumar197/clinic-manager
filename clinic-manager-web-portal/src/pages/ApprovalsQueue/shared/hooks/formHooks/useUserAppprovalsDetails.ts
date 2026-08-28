import { UserApprovalDetails } from "@/services";
import { UserApprovalService } from "@/services/modules/userApproval.service";
import { useEffect, useState } from "react";

export const useUserApprovalsDetails = (id: string | null) => {
  const [details, setDetails] = useState<UserApprovalDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await UserApprovalService.getApprovalById(id);
      setDetails({
        ...response,
        patient: response.patient ?? null,
        approval: response.approval ?? null,
        form_flag: response.form_flag ?? null,
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
