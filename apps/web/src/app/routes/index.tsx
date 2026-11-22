import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { Suspense } from 'react';

import RootLayout from '@shared/components/layouts/RootLayout';
import LoadingFallback from '@shared/components/feedback/LoadingFallback';
import RouteErrorBoundary from '@shared/components/feedback/RouteErrorBoundary';
import {
  CoachPage,
  DashboardPage,
  HabitsPage,
  NotFoundPage,
  ProgressPage,
} from '@app/routes/pages';

/**
 * Route configuration with React Router v7.7 best practices
 * Features:
 * - Type-safe route definitions
 * - Error boundaries for each route
 * - Suspense boundaries around the lazy-loaded pages
 * - Proper error handling
 * - Layout-based route structure
 */
const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
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
        path: 'coach',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CoachPage />
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
 * - Pages loaded on demand
 * - Consistent loading states
 */
export const router = createBrowserRouter(routes);

// Export routes array for testing
export { routes };
