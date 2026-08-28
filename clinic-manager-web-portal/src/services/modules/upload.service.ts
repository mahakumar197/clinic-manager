import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export interface UploadResponse {
  url: string;
  key: string;
}

export interface UploadFileParams {
  file: File | string;
  category: string; // Message | Task | Content | etc
  folderPath?: string;
}

export const uploadService = {
  async uploadFile({
    file,
    category,
    folderPath,
  }: UploadFileParams): Promise<UploadResponse> {
    const formData = new FormData();

    if (typeof file === "string") {
      formData.append("url", file);
    } else {
      formData.append("file", file);
    }

    formData.append("category", category);

    if (folderPath) {
      formData.append("folderPath", folderPath);
    }

    const response = await dashboardAxiosInstance.post(
      ENDPOINTS.MEDIA.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  },
};
