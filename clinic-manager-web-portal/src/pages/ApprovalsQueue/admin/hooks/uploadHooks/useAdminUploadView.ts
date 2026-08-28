import { adminApprovalsServiceUpload } from "@/services/modules/adminApprovals.service";
import { ViewAdminUpload } from "@/services/types";
import { toast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

export const useAdminUploadView = (submissionId: string | null) => {
  const [data, setData] = useState<ViewAdminUpload | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUploadView = useCallback(async () => {
    if (!submissionId) return;
    try {
      setLoading(true);
      const result =
        await adminApprovalsServiceUpload.getApprovalUploadsSubmission(
          submissionId,
        );
      setData(result);
    } catch {
      toast.error("Failed to load upload content");
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchUploadView();
  }, [fetchUploadView]);

  return { data, loading, refetch: fetchUploadView };
};
