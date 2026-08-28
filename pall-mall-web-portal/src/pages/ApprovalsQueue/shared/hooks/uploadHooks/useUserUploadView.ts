import { useState, useEffect } from "react";
import { UserUploadApprovalService } from "@/services/modules/userApproval.service";
import { ViewUserUpload } from "@/services/types";

export const useUserUploadView = (submissionId: string | null) => {
  const [data, setData] = useState<ViewUserUpload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submissionId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await UserUploadApprovalService.getUserApprovalUploadsSubmission(submissionId);
        setData(result);
      } catch (error) {
        console.error("Error fetching user upload submission:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId]);

  return { data, loading };
};
