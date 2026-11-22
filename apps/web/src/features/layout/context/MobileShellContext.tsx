// Connects page-level MobileNavBar instances to the root-mounted ProfileSettingsSheet
// and Clerk user info so individual page components stay decoupled from ClerkProvider.

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import ProfileSettingsSheet from '@/features/layout/components/ProfileSettingsSheet';
import { MobileShellContext } from '@/features/layout/context/MobileShellContextDefinition';

export function MobileShellProvider({ children }: { children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user } = useUser();

  const openSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const displayName =
    user?.firstName ??
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    '';
  const userInitial = displayName.slice(0, 1).toUpperCase();

  const value = useMemo(
    () => ({
      openSettings,
      userImageUrl: user?.imageUrl,
      userInitial,
    }),
    [openSettings, user?.imageUrl, userInitial],
  );

  return (
    <MobileShellContext.Provider value={value}>
      {children}
      {settingsOpen ? (
        <ProfileSettingsSheet
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      ) : null}
    </MobileShellContext.Provider>
  );
}
