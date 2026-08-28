import dashboardAxiosInstance from "@/services/api/dashboardAxiosInstance";

export const fileUploadService = {
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await dashboardAxiosInstance.post(
      "/uploads",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
    // expected: { s3Key: string }
  },
};
