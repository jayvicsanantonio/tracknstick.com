import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Suspense } from 'react';

// Import existing components for now - will be converted to page components in Phase 2
import Welcome from '@/features/layout/components/Welcome';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';
import HabitsOverview from '@/features/habits/components/HabitsOverview';
import ProgressOverview from '@/features/progress/components/ProgressOverview';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ROUTES } from '@/utils/navigation';

// Loading component for Suspense boundaries
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Error boundary component for route-level errors
function ErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
        Something went wrong
      </h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Please try refreshing the page.
      </p>
    </div>
  );
}

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
  usePageTitle('Dashboard');

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
  usePageTitle('Habits');

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
  usePageTitle('Progress');

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
  usePageTitle('Page Not Found');

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
 * Route configuration with React Router v7.7 best practices
 * Features:
 * - Type-safe route definitions
 * - Error boundaries for each route
 * - Suspense boundaries for future lazy loading
 * - Proper error handling
 */
const routes: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <DashboardPage />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: ROUTES.HABITS,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HabitsPage />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: ROUTES.PROGRESS,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProgressPage />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Router configuration using React Router v7.7
 * Enhanced with:
 * - Better error handling
 * - Type safety
 * - Future-ready for lazy loading
 * - Consistent loading states
 */
export const router = createBrowserRouter(routes);
