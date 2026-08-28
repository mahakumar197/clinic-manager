
import { useCallback, useEffect, useState } from "react";
import { contentService } from "@/services/modules/content.service";
import { Content, ContentCounts, Pagination } from "@/services";

/* ----------------------------------
 * Types
 * ---------------------------------- */
export interface ContentFilters {
  search?: string;
  type?: string;
  status?: string;
  procedureId?: string;
}

/* ----------------------------------
 * useContent Hook
 * ----------------------------------
 * Responsibilities:
 * - Fetch content list
 * - Maintain filters
 * - Maintain pagination state
 * - Expose simple helpers to UI
 * ---------------------------------- */
export const useContent = (initialFilters: ContentFilters = {}) => {
  /* ----------------------------------
   * Data State (API data)
   * ---------------------------------- */
  const [contents, setContents] = useState<Content[]>([]);
  const [counts, setCounts] = useState<ContentCounts>({
    image: 0,
    video: 0,
    blog: 0,
    elearning: 0,
    total: 0,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  /* ----------------------------------
   * UI State
   * ---------------------------------- */
  const [filters, setFilters] = useState<ContentFilters>(initialFilters);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------
   * Fetch content from API
   * ---------------------------------- */
  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await contentService.getContents({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      // Set API response to state (same flow)
      setContents(response.contents);
      setCounts(response.counts);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /* ----------------------------------
   * Auto fetch when filters / pagination change
   * ---------------------------------- */
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  /* ----------------------------------
   * Public helpers for UI
   * ---------------------------------- */

  // AUTO PAGE CORRECTION EFFECT

  useEffect(() => {
    if (!loading && contents.length === 0 && pagination.page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  }, [contents.length, pagination.page, loading]);

  /**
   * Update filters
   * - Used for category, search, status filters
   * - Resets page to 1
   */
  const updateFilters = (newFilters: Partial<ContentFilters>) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  /**
   * Change page number
   * - Used by pagination component
   */
  const changePage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  /**
   * Change rows per page
   * - Resets page to 1
   */
  const changeLimit = (limit: number) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      limit,
    }));
  };

  /**
   * Manually refetch content
   * - Used after create / edit / delete
   */
  const refresh = () => {
    fetchContent();
  };

  /* ----------------------------------
   * Exposed API to components
   * ---------------------------------- */
  return {
    // data
    contents,
    counts,
    pagination,

    // state
    loading,
    error,

    // actions
    updateFilters,
    changePage,
    changeLimit,
    refresh,
  };
};
