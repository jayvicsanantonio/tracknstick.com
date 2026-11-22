// Whether the screen is phone-sized: narrower than Tailwind's sm breakpoint, where the phone layout applies.
// Follows the screen as it changes, such as a phone turning sideways.

import { useSyncExternalStore } from 'react';

/** Below sm (640px), as Tailwind's `max-sm:` variant applies. */
export const PHONE_QUERY = '(max-width: 639.98px)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function isPhone() {
  return window.matchMedia(PHONE_QUERY).matches;
}

export function useIsPhone(): boolean {
  return useSyncExternalStore(subscribe, isPhone);
}
