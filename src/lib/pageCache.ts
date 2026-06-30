/**
 * In-memory page state cache.
 *
 * When a user navigates away from a page (React Router unmounts the component),
 * the page saves its important state into this cache. When the user comes back,
 * the page reads from the cache to restore exactly where they left off.
 *
 * The cache lives in module scope (JS heap), so it survives React Router
 * navigation but is cleared on a full browser refresh — which is the expected UX.
 */

const cache: Record<string, Record<string, any>> = {};

/** Retrieve saved state for a page, or null if nothing was saved yet. */
export const getPageState = (pageKey: string): Record<string, any> | null =>
  cache[pageKey] ?? null;

/** Persist state for a page (called on unmount). */
export const setPageState = (pageKey: string, state: Record<string, any>): void => {
  cache[pageKey] = state;
};

/** Clear a specific page's cache (e.g. on logout). */
export const clearPageState = (pageKey: string): void => {
  delete cache[pageKey];
};

/** Clear all cached page states. */
export const clearAllPageState = (): void => {
  Object.keys(cache).forEach((k) => delete cache[k]);
};
