import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

// ─── Types ──────────────────────────────────────────────────────

export interface UseListDataOptions<TData, TParams extends Record<string, any>> {
  /**
   * Async function that fetches data.
   * Receives computed params and an AbortSignal for cancellation.
   */
  fetcher: (params: TParams, signal: AbortSignal) => Promise<TData>;

  /**
   * Current params (filters, pagination, sort, etc.).
   * Changes to these trigger a re-fetch.
   */
  params: TParams;

  /**
   * Param keys to debounce before triggering a fetch (e.g., ['search']).
   * Other param changes are applied immediately.
   */
  debounceKeys?: (keyof TParams)[];

  /** Debounce duration in ms. Default 400. */
  debounceMs?: number;
}

export interface UseListDataReturn<TData> {
  /** Latest resolved data (kept from previous fetch until new data arrives). */
  data: TData | null;

  /** True only when no data has ever been loaded. Use for skeleton/placeholder. */
  initialLoading: boolean;

  /** True whenever a fetch is in-flight (including refetches). Use for progress bar. */
  isFetching: boolean;

  /** Last error message, or null. */
  error: string | null;

  /** Manually re-run the current fetch. */
  refresh: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────

export const useListData = <TData, TParams extends Record<string, any>>(
  options: UseListDataOptions<TData, TParams>,
): UseListDataReturn<TData> => {
  const { fetcher, params, debounceKeys = [], debounceMs = 400 } = options;

  // ── Separate debounced and immediate params ──────────────────
  const immediateParams = useMemo(() => {
    const result = {} as Record<string, any>;
    for (const key of Object.keys(params)) {
      if (!debounceKeys.includes(key as keyof TParams)) {
        result[key] = params[key];
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(
    Object.fromEntries(
      Object.entries(params).filter(([k]) => !debounceKeys.includes(k as keyof TParams)),
    ),
  )]);

  const debouncedParamValues = useMemo(() => {
    const result = {} as Record<string, any>;
    for (const key of debounceKeys) {
      result[key as string] = params[key as string];
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(
    Object.fromEntries(
      Object.entries(params).filter(([k]) => debounceKeys.includes(k as keyof TParams)),
    ),
  )]);

  const debouncedValues = useDebounce(debouncedParamValues, debounceMs);

  // ── Merge debounced + immediate into the final fetch params ──
  const effectiveParams = useMemo(
    () => ({ ...immediateParams, ...debouncedValues }) as TParams,
    [immediateParams, debouncedValues],
  );

  // ── State ────────────────────────────────────────────────────
  const [data, setData] = useState<TData | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // ── Fetch logic ──────────────────────────────────────────────
  const runFetch = useCallback(
    async (fetchParams: TParams) => {
      // Abort any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setIsFetching(true);
      setError(null);

      try {
        const result = await fetcherRef.current(fetchParams, controller.signal);

        // Only apply result if this controller wasn't aborted
        if (!controller.signal.aborted) {
          setData(result);
          hasLoadedOnce.current = true;
        }
      } catch (err: any) {
        // Ignore aborted requests (they are expected)
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          return;
        }
        if (!controller.signal.aborted) {
          setError(err?.message || "Failed to load data");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsFetching(false);
        }
      }
    },
    [], // stable — fetcher accessed via ref
  );

  // ── Auto-fetch when effective params change ──────────────────
  useEffect(() => {
    runFetch(effectiveParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveParams]);

  // ── Cleanup on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ── Manual refresh ───────────────────────────────────────────
  const refresh = useCallback(() => {
    runFetch(effectiveParams);
  }, [runFetch, effectiveParams]);

  return {
    data,
    initialLoading: isFetching && !hasLoadedOnce.current,
    isFetching,
    error,
    refresh,
  };
};
