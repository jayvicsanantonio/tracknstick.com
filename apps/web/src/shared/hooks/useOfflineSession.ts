// Tells whether to treat the last visit's user as signed in: offline, Clerk cannot load to say.
// The service worker then answers the app's API requests from that user's cached responses.

import { useSyncExternalStore } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_CACHE_OWNER_KEY } from '@shared/constants/apiCache';

function subscribeToConnection(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

const isOnline = () => navigator.onLine;

/**
 * Whether a user was signed in on the last visit. useClearApiCacheOnUserChange
 * records the user the cached API responses belong to, and an empty string
 * when no one was signed in.
 */
function wasSignedInLastVisit(): boolean {
  try {
    return Boolean(localStorage.getItem(API_CACHE_OWNER_KEY));
  } catch {
    return false;
  }
}

/**
 * True while the device is offline, Clerk has not loaded, and a user was
 * signed in on the last visit. Clerk loads its script and the session from
 * its own servers, so offline it never loads, and its SignedIn shows nothing.
 */
export function useOfflineSession(): boolean {
  const { isLoaded } = useAuth();
  const online = useSyncExternalStore(subscribeToConnection, isOnline);

  return !isLoaded && !online && wasSignedInLastVisit();
}
