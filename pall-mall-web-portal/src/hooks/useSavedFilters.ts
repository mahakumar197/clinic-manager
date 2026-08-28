import { useCallback, useEffect, useState } from "react";
import { savedFiltersService } from "@/services/modules/savedFilters.service";
import { FilterModule, SavedFilter } from "@/types/savedFilter";
import { toast } from "@/utils/toast";

interface SaveFilterPayload {
  filterName: string;
  filterData: Record<string, any>;
}

export const useSavedFilters = (type: FilterModule) => {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await savedFiltersService?.getFilters(type);
      setFilters(data);
      
    } catch (err: any) {
      console.error("Failed to fetch saved filters", err);
      setError("Failed to load saved filters");
      toast.error("Failed to load saved filters");
    } finally {
      setLoading(false);
    }
  }, [type]);

  const saveFilter = async (payload: SaveFilterPayload) => {
    setLoading(true);
    setError(null);

    try {
      await savedFiltersService.createFilter({
        type,
        ...payload,
      });
      await fetchFilters();
      toast.success("Filter saved successfully");
    } catch (err: any) {
      console.error("Failed to save filter", err);
      setError("Failed to save filter");
      toast.error("Failed to save filter");
    } finally {
      setLoading(false);
    }
  };

  const deleteFilter = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await savedFiltersService.deleteFilter(id);
      await fetchFilters();
      toast.success("Filter deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete filter", err);
      setError("Failed to delete filter");
      toast.error("Failed to delete filter");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  return {
    filters,
    loading,
    error,
    saveFilter,
    deleteFilter,
    refetch: fetchFilters,
  };
};
