import { ZohoFormService } from "@/services/modules/zoho.service";
import { useCallback, useEffect, useState } from "react";

interface ZohoForm {
  id: string;
  name: string;
}

interface UseZohoForms {
  zohoForm: ZohoForm[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
export const useZohoForms = () : UseZohoForms => {
  const [zohoForm, setZohoForm] = useState<ZohoForm[]>([])
 const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZohoFormNames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await ZohoFormService.getZohoForms();
      setZohoForm(data ?? [])
    } catch (err: any) {
      setError(err?.response?.message || "Failed to fetch zoho form names");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
      fetchZohoFormNames();
    }, [fetchZohoFormNames]);

  return {
    zohoForm,
    loading,
    error,
    refetch: fetchZohoFormNames,
  };
};
