import dashboardAxiosInstance from "@/services/api/dashboardAxiosInstance";
import { FilterModule, SavedFilter } from "@/types/savedFilter";

interface CreateFilterPayload {
  type: FilterModule;
  filterName: string;
  filterData: SavedFilter["filterData"];
}

export const savedFiltersService = {
  /**
   * Fetch saved filters for a type
   */
  async getFilters(type: FilterModule): Promise<SavedFilter[]> {
    const res = await dashboardAxiosInstance.get("/filters", {
      params: { type },
    });

    return res.data.data; // BE owns shape
  },

  /**
   * Create a new saved filter
   */
  async createFilter(payload: CreateFilterPayload): Promise<SavedFilter> {
    const res = await dashboardAxiosInstance.post("/filters", payload);
    return res.data.data;
  },

  /**
   * Delete a saved filter
   */
  async deleteFilter(filterId: string): Promise<void> {
    await dashboardAxiosInstance.delete(`/filters/${filterId}`);
  },
};
