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
      <div className="text-foreground min-h-screen bg-purple-50 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_40%)] bg-fixed px-2 sm:px-4 md:px-8 dark:bg-slate-950 dark:bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.08),transparent_40%)]">
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
