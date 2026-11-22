// The SWR cache, saved to localStorage when the app is put away and read back when it opens.
// The app then opens to what it last showed, as a native app does, and refreshes it in the background.

import { API_CACHE_OWNER_KEY } from '@shared/constants/apiCache';

export const SWR_CACHE_STORAGE_KEY = 'track-n-stick-swr-cache';

/** One cached request's state, as SWR keeps it. Only `data` is saved. */
interface CacheState {
  data?: unknown;
  [field: string]: unknown;
}

/** The saved copy: whose data it is, and each request's data by its key. */
interface SavedCache {
  owner: string;
  entries: [key: string, data: unknown][];
}

/**
 * The user the cached data belongs to: the one useClearApiCacheOnUserChange
 * last saw signed in, or '' when no one is.
 */
function currentOwner(): string {
  return localStorage.getItem(API_CACHE_OWNER_KEY) ?? '';
}

/** The saved entries, if they belong to the user now signed in. */
function readSaved(): [string, CacheState][] {
  const owner = currentOwner();
  if (!owner) return [];
  try {
    const saved = JSON.parse(
      localStorage.getItem(SWR_CACHE_STORAGE_KEY) ?? 'null',
    ) as SavedCache | null;
    if (!saved || saved.owner !== owner || !Array.isArray(saved.entries)) {
      return [];
    }
    return saved.entries.map(([key, data]) => [key, { data }]);
  } catch {
    // An unreadable copy is no worse than none: the app fetches afresh.
    return [];
  }
}

/**
 * A cache for SWRConfig's `provider`, holding the data saved last time.
 *
 * It is saved whenever the app is hidden, which on iOS is the last moment a
 * home-screen app is sure to run: switching apps or locking the phone hides
 * it, and iOS may end it after that without a word. Errors and loading state
 * are left out, so a saved copy holds only data the server sent.
 */
export function createPersistentCache(): Map<string, CacheState> {
  const cache = new Map<string, CacheState>(readSaved());

  const save = () => {
    const owner = currentOwner();
    if (!owner) return;
    const entries: SavedCache['entries'] = [];
    for (const [key, state] of cache) {
      if (state?.data !== undefined) entries.push([key, state.data]);
    }
    try {
      localStorage.setItem(
        SWR_CACHE_STORAGE_KEY,
        JSON.stringify({ owner, entries } satisfies SavedCache),
      );
    } catch (error) {
      // Storage full or unavailable: the app still works, it just opens
      // without last time's data.
      console.warn('Could not save the data cache:', error);
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });
  window.addEventListener('pagehide', save);

  return cache;
}

/** Forgets every cached response, in memory and in the saved copy. */
export function clearPersistentCache(cache: {
  keys(): IterableIterator<string>;
  delete(key: string): void;
}): void {
  for (const key of [...cache.keys()]) cache.delete(key);
  localStorage.removeItem(SWR_CACHE_STORAGE_KEY);
}
