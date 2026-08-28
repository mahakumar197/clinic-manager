import dashboardAxiosInstance from "../api/dashboardAxiosInstance";

export interface TaskTemplate {
  id: string;
  template: {
    templateName: string;
    taskName?: { name: string };
    taskDescription?: { name: string };
    phase?: { id: number; beValue: string };
    taskCategory?: { id: number; beValue: string };
    zohoForm?: { id: number; beValue: string };
    contentType?: { id: number; beValue: string };
  };
}

export const taskTemplatesService = {
  async getTemplates(): Promise<TaskTemplate[]> {
    const response = await dashboardAxiosInstance.get("/task-templates");

    return response.data?.data ?? [];
  },
};
