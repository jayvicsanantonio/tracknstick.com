// Discards the service worker's cached API responses when the signed-in user changes
// The cache is keyed by URL alone, so one user's responses would otherwise be served to the next

import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  API_CACHE_NAME,
  API_CACHE_OWNER_KEY,
} from '@shared/constants/apiCache';

/**
 * Remembers which user the cached API responses belong to and clears the
 * cache whenever someone else (or no one) is signed in.
 *
 * The owner is kept in localStorage rather than in memory because the change
 * can happen while the app is closed: a session expires, and the next person
 * to open the app on this browser signs in as a different user.
 */
export function useClearApiCacheOnUserChange() {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    // Until Clerk has loaded it reports no user, which is not a sign-out.
    if (!isLoaded) return;

    const owner = userId ?? '';
    if (localStorage.getItem(API_CACHE_OWNER_KEY) === owner) return;

    localStorage.setItem(API_CACHE_OWNER_KEY, owner);
    if ('caches' in window) {
      void caches.delete(API_CACHE_NAME);
    }
  }, [isLoaded, userId]);
}
