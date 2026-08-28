import { useEffect, useState } from "react";
import { adminApprovalsServiceUpload } from "../../../../../services/modules/adminApprovals.service";
import { UploadApprovalDetails } from "../../../../../services/types";

export const useUploadAdminDetails = (id: string | null) => {
  const [details, setDetails] = useState<UploadApprovalDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response =
        await adminApprovalsServiceUpload.getUploadApprovalById(id);
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
