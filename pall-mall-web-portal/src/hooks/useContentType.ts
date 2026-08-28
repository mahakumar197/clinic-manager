import { useState, useEffect, useCallback } from "react";
import { ContentTypeService } from "@/services/modules/contentType.service";

interface ContentType {
  id: string;
  title: string;
}

interface UseContentTypes {
  contentTypes: ContentType[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useContentTypes = (): UseContentTypes => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContentTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await ContentTypeService.getContentTypes();
      setContentTypes(data ?? []);
    } catch (err: any) {
      setError(err?.response?.message || "Failed to fetch content types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentTypes();
  }, [fetchContentTypes]);

  return { contentTypes, loading, error, refetch: fetchContentTypes };
};