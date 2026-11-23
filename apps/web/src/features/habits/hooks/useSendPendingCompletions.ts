// Sends the habit changes kept on the device once a signed-in user is online.
// Mounted once, in App; coming back online sends them too.

import { useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { mutate } from 'swr';
import {
  pendingCompletions,
  sendPendingCompletions,
  subscribeToPendingCompletions,
} from '@/features/habits/api/pendingCompletions';
import { useIsOnline } from '@shared/hooks/useIsOnline';

export function useSendPendingCompletions(): void {
  const { isSignedIn, userId } = useAuth();
  const online = useIsOnline();
  const pending = useSyncExternalStore(
    subscribeToPendingCompletions,
    pendingCompletions,
  );
  const hasPending = pending.length > 0;

  useEffect(() => {
    if (!isSignedIn || !userId || !online || !hasPending) return;

    void sendPendingCompletions(userId).then(() =>
      // The lists, progress and stats all count completions: fetch them all.
      mutate(() => true),
    );
  }, [isSignedIn, userId, online, hasPending]);
}
