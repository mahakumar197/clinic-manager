import { useEffect, useState, useCallback } from "react";
import { tasksService } from "@/services/modules/tasks.service";
import {
  TaskDetails,
  TaskActivity,
  TaskComment,
  TaskAttachment,
  TaskAssignee,
} from "@/services/types";

interface UseTaskDetailsResult {
  task: TaskDetails | null;
  activity: TaskActivity[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  assignees: TaskAssignee[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTaskDetails = (taskId: string): UseTaskDetailsResult => {
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [assignees, setAssignees] = useState<TaskAssignee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await tasksService.getTaskById(taskId);

      setTask(data.task);
      setActivity(data.activity);
      setComments(data.comments);
      setAttachments(data.attachments);
      setAssignees(data.assignees);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch task details");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, fetchTaskDetails]);

  return {
    task,
    activity,
    comments,
    attachments,
    assignees,
    loading,
    error,
    refetch: fetchTaskDetails,
  };
};
