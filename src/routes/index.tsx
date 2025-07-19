import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { Suspense } from 'react';

import RootLayout from '@/layouts/RootLayout';

import DashboardPage from '@/pages/DashboardPage';
import HabitsPage from '@/pages/HabitsPage';
import ProgressPage from '@/pages/ProgressPage';
import NotFoundPage from '@/pages/NotFoundPage';

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
 * Route configuration with React Router v7.7 best practices
 * Features:
 * - Type-safe route definitions
 * - Error boundaries for each route
 * - Suspense boundaries for future lazy loading
 * - Proper error handling
 * - Layout-based route structure
 */
const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'habits',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HabitsPage />
          </Suspense>
        ),
      },
      {
        path: 'progress',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProgressPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
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
