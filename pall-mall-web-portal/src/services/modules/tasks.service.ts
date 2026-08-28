import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { normalizePagination } from "../api/normalizePagination";
import { ENDPOINTS } from "../api/endpoints";
import {
  TasksResponse,
  TaskDetailsResponse,
  CreateTaskPayload,
  CreateCommentPayload,
  CreateTaskAttachmentPayload,
  GetTasksParams,
  TaskExportResponse,
} from "../types";

export const tasksService = {
  // ---------------------------
  // GET TASK LIST
  // ---------------------------
  async getTasks(params: GetTasksParams, signal?: AbortSignal): Promise<TasksResponse> {
    const response = await dashboardAxiosInstance.get(ENDPOINTS.TASKS.LIST, {
      params,
      signal,
    });

    const apiData = response.data;
    const dataBlock = apiData.data?.[0];

    return {
      tasks: dataBlock?.tasks ?? [],
      statusCounts: dataBlock?.statusCounts ?? {},
      pagination: normalizePagination(apiData.meta?.pagination),
    };
  },

  // ---------------------------
  // EXPORT TASKS (No Pagination)
  // ---------------------------
  async exportTasks(payload: {
      search?: string;
      status?: string;
      phase?: string;
      procedure_type?: string;
      start_date?: string;
      end_date?: string;
      due_date?: string;
  }): Promise<TaskExportResponse> {
    const response = await dashboardAxiosInstance.post(ENDPOINTS.TASKS.EXPORT, payload);
    return response.data;
  },

  // ---------------------------
  // GET TASK DETAILS BY ID
  // ---------------------------
  async getTaskById(taskId: string): Promise<TaskDetailsResponse> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.TASKS.DETAILS(taskId)
    );

    const apiData = response.data;

    return {
      task: apiData.data?.task ?? null,
      activity: apiData.data?.activity ?? [],
      comments: apiData.data?.comments ?? [],
      assignees: apiData.data?.assignees ?? [],
      attachments: apiData.data?.attachments ?? [],
    };
  },

  async createTask(payload: CreateTaskPayload) {
    const response = await dashboardAxiosInstance.post(
      ENDPOINTS.TASKS.CREATE,
      payload
    );

    return response.data;
  },

  async updateTask(taskId: string, payload: CreateTaskPayload) {
    const response = await dashboardAxiosInstance.patch(
      ENDPOINTS.TASKS.DETAILS(taskId),
      payload
    );

    return response.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await dashboardAxiosInstance.delete(ENDPOINTS.TASKS.DETAILS(taskId));
  },

  async recoverTask(taskId: string): Promise<void> {
    await dashboardAxiosInstance.patch(ENDPOINTS.TASKS.RECOVER(taskId));
  },

  async createComment(payload: CreateCommentPayload) {
    const response = await dashboardAxiosInstance.post(
      "/task-comments",
      payload
    );

    return response.data;
  },

  async createAttachment(payload: CreateTaskAttachmentPayload) {
    const response = await dashboardAxiosInstance.post(
      "/tasks-attachments",
      payload
    );

    return response.data;
  },

  async reassignTask(taskId: string, userId: string) {
    const response = await dashboardAxiosInstance.put(
      `${ENDPOINTS.TASKS.DETAILS(taskId)}?assignedTo=${userId}`
    );

    return response.data;
  },
};
