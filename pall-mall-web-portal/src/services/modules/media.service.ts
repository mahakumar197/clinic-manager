import axiosInstance from "@/services/api/axiosInstance";
import { ENDPOINTS, MAIN_API_BASE_URL } from "@/services/api/endpoints";
import dashboardAxiosInstance from "../api/dashboardAxiosInstance";

export const mediaService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // formData.append("category", "Message");

    const response = await axiosInstance.post(
      ENDPOINTS.MEDIA.UPLOAD,
      formData,
      {
        baseURL: MAIN_API_BASE_URL,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  getFileUrl: async (key: string): Promise<string> => {
    const res = await dashboardAxiosInstance.get("/media/file-url", {
      params: { key },
    });

    return res.data?.data?.url;
  },
};
