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
