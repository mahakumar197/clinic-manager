import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { ENDPOINTS } from "../api/endpoints";

export const ZohoFormService = {
  //Zoho form dropdown
  async getZohoForms() {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.ZOHO.ZOHO_FORM,
    );

    return response.data?.data ?? response.data;
  },
};
