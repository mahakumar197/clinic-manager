import { useState } from "react";
import { tasksService } from "@/services/modules/tasks.service";
import { CreateTaskPayload } from "../types";

export const useCreateTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (payload: CreateTaskPayload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tasksService.createTask(payload);
      return response;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to create task";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTask,
    loading,
    error,
  };
};
