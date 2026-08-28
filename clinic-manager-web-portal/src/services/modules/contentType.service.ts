import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const ContentTypeService = {
  async getContentTypes() {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.CONTENTTYPE.CONTENT_TYPE,
    );

    return response.data?.data ?? response.data;
  },
};
