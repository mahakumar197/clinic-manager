import { UserUploadApprovalService } from "@/services/modules/userApproval.service";
import { UploadUserApproveOrRejectPayload, UploadUserGetComments } from "@/services/types";
import { toast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

export const useUserUploadComments = (submissionId: string | null) => {
  const [comments, setComments] = useState<UploadUserGetComments[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ---------------------------
  // FETCH COMMENTS
  // ---------------------------
  const fetchComments = useCallback(async () => {
    if (!submissionId) return;

    try {
      setLoading(true);
      const data =
        await UserUploadApprovalService.getUploadApprovalsComments(submissionId);
      setComments(data);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  // ---------------------------
  // ADD COMMENT
  // ---------------------------
  const addComment = async (comment: string) => {
    if (!submissionId || !comment.trim()) return;

    try {
      setPosting(true);

      await UserUploadApprovalService.createUploadApprovalsComments({
        submissionId,
        comment,
      });

      toast.success("Comment added");
      fetchComments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setPosting(false);
    }
  };

  // ---------------------------
  // APPROVE / REJECT
  // ---------------------------
  const updateStatus = async (
    payload: UploadUserApproveOrRejectPayload,
    successMessage: string,
  ) => {
    try {
      setActionLoading(true);
      await UserUploadApprovalService.updateUploadApprovalStatus(payload);
      toast.success(successMessage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const approve = (payload: UploadUserApproveOrRejectPayload) =>
    updateStatus(payload, "Approval successful");

  const reject = (payload: UploadUserApproveOrRejectPayload) =>
    updateStatus(payload, "Rejected successfully");

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    posting,
    actionLoading,
    addComment,
    approve,
    reject,
    refetch: fetchComments,
  };
};
