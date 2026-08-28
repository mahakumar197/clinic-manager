import { UserUploadApprovalService } from "@/services/modules/userApproval.service";
import { useEffect, useState } from "react";
import { UploadUserApprovalDetails } from "../../../../../services/types";

export const useUploadUserDetails = (id: string | null) => {
  const [details, setDetails] = useState<UploadUserApprovalDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await UserUploadApprovalService.getUploadApprovalById(id);
      setDetails({
        ...response,
        patient: response.patient ?? null,
        assigned_to_user: response.assigned_to_user ?? null,
        task: response.task ?? null,
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
