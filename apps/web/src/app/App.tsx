import { SignedIn } from '@clerk/clerk-react';
import { HabitsStateProvider } from '@features/habits/context/HabitsStateContext';
import AddHabitDialog from '@features/habits/components/AddHabitDialog';
import EditHabitDialog from '@features/habits/components/EditHabitDialog';
import { PWAInstallPrompt } from '@shared/components/feedback/PWAInstallPrompt';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary';
import { APP_MAX_WIDTH } from '@shared/constants/layout';
import { useClearApiCacheOnUserChange } from '@shared/hooks/useClearApiCacheOnUserChange';
import { cn } from '@shared/utils/utils';
import { ReactNode, memo } from 'react';

interface AppProps {
  children: ReactNode;
}

const AppContent = memo(function AppContent({ children }: AppProps) {
  return (
    <>
      {children}
      <AddHabitDialog />
      <EditHabitDialog />
      {/* Offered once signed in: on the welcome page it would cover a
          first-time visitor's Get started button. */}
      <SignedIn>
        <PWAInstallPrompt />
      </SignedIn>
    </>
  );
});

function App({ children }: AppProps) {
  useClearApiCacheOnUserChange();

  return (
    <ErrorBoundary>
      <div data-ios-shell="" className="text-foreground min-h-dvh">
        {/* Subtle ambient aurora accents on tablet & desktop harmonized with the
            calm open canvas used on phones. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 hidden sm:block"
        >
          <div className="absolute top-[-10%] left-[-10%] h-[40vmax] w-[40vmax] rounded-full bg-(--color-brand-light) opacity-18 blur-3xl" />
          <div className="absolute top-[20%] right-[-15%] h-[36vmax] w-[36vmax] rounded-full bg-(--color-brand-primary)/22 opacity-18 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[20%] h-[32vmax] w-[32vmax] rounded-full bg-(--color-accent) opacity-14 blur-3xl" />
        </div>
        <div
          className={cn(
            'mx-auto flex min-h-dvh w-full flex-col',
            APP_MAX_WIDTH,
          )}
        >
          <HabitsStateProvider>
            <AppContent>{children}</AppContent>
          </HabitsStateProvider>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
