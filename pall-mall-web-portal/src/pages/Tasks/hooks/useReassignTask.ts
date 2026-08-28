import { useState } from "react";
import { tasksService } from "@/services/modules/tasks.service";
import { toast } from "@/utils/toast";

export const useReassignTask = (taskId: string, onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);

  const reassign = async (userId: string) => {
    try {
      setLoading(true);

      await tasksService.reassignTask(taskId, userId);

      toast.success("Task reassigned successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reassign task");
    } finally {
      setLoading(false);
    }
  };

  return {
    reassign,
    loading,
  };
};
