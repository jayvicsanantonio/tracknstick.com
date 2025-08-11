import { HabitsStateProvider } from '@features/habits/context/HabitsStateContext';
import AddHabitDialog from '@features/habits/components/AddHabitDialog';
import EditHabitDialog from '@features/habits/components/EditHabitDialog';
import { PWAInstallPrompt } from '@shared/components/feedback/PWAInstallPrompt';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary';
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
  return (
    <ErrorBoundary>
      <div className="text-foreground min-h-screen px-2 [scroll-timeline-name:--wicked] sm:px-4 md:px-8">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="bg-(--color-brand-light) absolute left-[-10%] top-[-10%] h-[40vmax] w-[40vmax] rounded-full opacity-25 blur-3xl" />
          <div className="bg-(--color-brand-primary)/30 absolute right-[-15%] top-[20%] h-[36vmax] w-[36vmax] rounded-full opacity-25 blur-3xl" />
          <div className="bg-(--color-accent) absolute bottom-[-15%] left-[20%] h-[32vmax] w-[32vmax] rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col">
          <HabitsStateProvider>
            <AppContent>{children}</AppContent>
          </HabitsStateProvider>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
