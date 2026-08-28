import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { DropdownType } from "../api/endpoints";

/**
 * Raw dropdown item returned by backend
 */
export interface DropdownApiItem {
  id: string;
  value:string;
  label:string ;
  beValue: string;
  enValue?: string;
}

export const dropdownsService = {
  async getDropdown(type: DropdownType): Promise<DropdownApiItem[]> {
    const response = await dashboardAxiosInstance.get(`/dropdowns/${type}`);
    return response.data?.data;
  },
};
