import { createBrowserRouter } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

// Import existing components for now - will be converted to page components in Phase 2
import Welcome from '@/features/layout/components/Welcome';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';
import HabitsOverview from '@/features/habits/components/HabitsOverview';
import ProgressOverview from '@/features/progress/components/ProgressOverview';

/**
 * Layout component that handles authentication-based rendering
 * This is a temporary wrapper until Phase 2 when we create proper page components
 */
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <h1 className="sr-only">Welcome</h1>
        <Welcome />
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
}

/**
 * Dashboard page component (default route)
 */
function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <h1 className="sr-only">Daily Habit Tracker</h1>
      <DailyHabitTracker />
    </AuthenticatedLayout>
  );
}

/**
 * Habits page component
 */
function HabitsPage() {
  return (
    <AuthenticatedLayout>
      <h1 className="sr-only">Habits Overview</h1>
      <HabitsOverview />
    </AuthenticatedLayout>
  );
}

/**
 * Progress page component
 */
function ProgressPage() {
  return (
    <AuthenticatedLayout>
      <h1 className="sr-only">Progress Overview</h1>
      <ProgressOverview />
    </AuthenticatedLayout>
  );
}

/**
 * 404 Not Found page component
 */
function NotFoundPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          404 - Page Not Found
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    </AuthenticatedLayout>
  );
}

/**
 * Router configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/habits',
    element: <HabitsPage />,
  },
  {
    path: '/progress',
    element: <ProgressPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
