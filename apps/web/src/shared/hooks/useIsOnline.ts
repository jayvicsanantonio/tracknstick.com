// Tells whether the browser reports a connection, and re-renders when that changes.
// The browser can report one that gets nowhere, such as Wi-Fi without internet.

import { useSyncExternalStore } from 'react';

function subscribeToConnection(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

const isOnline = () => navigator.onLine;

export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribeToConnection, isOnline);
}
