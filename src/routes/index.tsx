import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { Suspense } from 'react';

import RootLayout from '@/layouts/RootLayout';
import LoadingFallback from '@/components/LoadingFallback';
import ErrorBoundary from '@/components/ErrorBoundary';

import DashboardPage from '@/pages/DashboardPage';
import HabitsPage from '@/pages/HabitsPage';
import ProgressPage from '@/pages/ProgressPage';
import NotFoundPage from '@/pages/NotFoundPage';

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

// Export routes array for testing
export { routes };
