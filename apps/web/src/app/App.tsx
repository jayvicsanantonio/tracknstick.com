import { HabitsStateProvider } from '@features/habits/context/HabitsStateContext';
import AddHabitDialog from '@features/habits/components/AddHabitDialog';
import EditHabitDialog from '@features/habits/components/EditHabitDialog';
import { PWAInstallPrompt } from '@shared/components/feedback/PWAInstallPrompt';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary';
import { useClearApiCacheOnUserChange } from '@shared/hooks/useClearApiCacheOnUserChange';
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
      <PWAInstallPrompt />
    </>
  );
});

function App({ children }: AppProps) {
  useClearApiCacheOnUserChange();

  return (
    <ErrorBoundary>
      <div
        data-ios-shell=""
        className="text-foreground min-h-dvh sm:px-4 md:px-8"
      >
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
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col 2xl:max-w-[90rem]">
          <HabitsStateProvider>
            <AppContent>{children}</AppContent>
          </HabitsStateProvider>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
