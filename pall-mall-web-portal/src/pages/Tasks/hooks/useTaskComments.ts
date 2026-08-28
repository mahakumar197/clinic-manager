import { useState } from "react";
import { toast } from "@/utils/toast";
import { tasksService } from "@/services/modules/tasks.service";

export const useTaskComments = (
  taskId: string,
  refetchTaskDetails: () => void
) => {
  const [loading, setLoading] = useState(false);

  const addComment = async (comment: string, attachmentId?: string | null) => {
    // if (!comment.trim() && !attachmentId) return;

    try {
      setLoading(true);

      await tasksService.createComment({
        taskId,
        comment,
        ...(attachmentId && { attachmentId: attachmentId }),
      });

      toast.success("Comment added");

      // refresh task details to get latest comments
      refetchTaskDetails();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return {
    addComment,
    loading,
  };
};
