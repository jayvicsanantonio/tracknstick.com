// Tells whether to treat the last visit's user as signed in: offline, or once Clerk failed to load.
// The service worker then answers the app's API requests from that user's cached responses.

import { useAuth, useClerk } from '@clerk/clerk-react';
import { API_CACHE_OWNER_KEY } from '@shared/constants/apiCache';
import { useIsOnline } from '@shared/hooks/useIsOnline';

/**
 * The user signed in on the last visit, or null when no one was.
 * useClearApiCacheOnUserChange records the user the cached API responses
 * belong to, and an empty string when no one was signed in.
 */
export function lastSignedInUserId(): string | null {
  try {
    // An empty string records that no one was signed in.
    const userId = localStorage.getItem(API_CACHE_OWNER_KEY);
    return userId === '' ? null : userId;
  } catch {
    return null;
  }
}

/**
 * True when Clerk has not loaded, a user was signed in on the last visit, and
 * either the device is offline or Clerk has given up loading. Clerk loads its
 * script and the session from its own servers, so without a connection it
 * never loads, and its SignedIn shows nothing. A connection that the browser
 * reports as online but that gets nowhere (Wi-Fi without internet) is only
 * found out when Clerk gives up, after its script load timeout.
 */
export function useOfflineSession(): boolean {
  const { isLoaded } = useAuth();
  const { status } = useClerk();
  const online = useIsOnline();

  if (isLoaded || !lastSignedInUserId()) return false;
  return !online || status === 'error';
}
