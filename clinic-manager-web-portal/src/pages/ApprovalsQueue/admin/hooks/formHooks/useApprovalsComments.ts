import { adminApprovalsService } from "@/services/modules/adminApprovals.service";
import { ApprovalsGetComments, ApproveOrRejectPayload } from "@/services/types";
import { toast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

export const useApprovalComments = (submissionId: string | null) => {
  const [comments, setComments] = useState<ApprovalsGetComments[]>([]);
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
        await adminApprovalsService.getApprovalsComments(submissionId);
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

      await adminApprovalsService.createApprovalsComments({
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
    payload: ApproveOrRejectPayload,
    successMessage: string,
  ) => {
    try {
      setActionLoading(true);
      await adminApprovalsService.updateApprovalStatus(payload);
      toast.success(successMessage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const approve = (payload: ApproveOrRejectPayload) =>
    updateStatus(payload, "Approval successful");

  const reject = (payload: ApproveOrRejectPayload) =>
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
