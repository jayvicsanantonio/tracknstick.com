// Shows its children to the signed-in user, and to the last visit's user while offline.
// Online it is Clerk's SignedIn; offline Clerk cannot load, and SignedIn would show nothing.

import type { ReactNode } from 'react';
import { SignedIn } from '@clerk/clerk-react';
import { useOfflineSession } from '@shared/hooks/useOfflineSession';

export default function SignedInOrOffline({
  children,
}: {
  children: ReactNode;
}) {
  const offline = useOfflineSession();

  return offline ? <>{children}</> : <SignedIn>{children}</SignedIn>;
}
