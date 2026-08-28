import { lazy, ComponentType } from "react";

/**
 * A wrapper around React.lazy that retries the dynamic import on failure.
 *
 * This handles the common "Failed to fetch dynamically imported module" error
 * that occurs when a new deployment replaces old JS chunks while users still
 * have the previous version cached. On failure, it triggers a page reload
 * (once) to fetch the updated chunk references.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
) {
  return lazy(() =>
    importFn().catch((error) => {
      const storageKey = "lazy-import-retry";
      const hasRetried = sessionStorage.getItem(storageKey);

      if (!hasRetried) {
        sessionStorage.setItem(storageKey, "1");
        window.location.reload();
        // Return a no-op component — won't actually render since we're reloading
        return { default: (() => null) as unknown as T };
      }

      // Already retried once — clear flag and throw the real error
      sessionStorage.removeItem(storageKey);
      throw error;
    }),
  );
}
