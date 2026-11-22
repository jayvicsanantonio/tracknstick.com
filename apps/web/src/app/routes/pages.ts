// The route pages, each loaded on demand, and a way to load the tab pages ahead of their first visit.
// The routes render the lazy components; RootLayout preloads the tabs once a user is signed in.

import { lazy } from 'react';

// Each page loads with its route, so the first page does not download the
// others: the progress charts, for one, load only on /progress.
const importDashboardPage = () => import('@/pages/DashboardPage');
const importHabitsPage = () => import('@/pages/HabitsPage');
const importProgressPage = () => import('@/pages/ProgressPage');
// The coach's chat and its markdown renderer load only on /coach.
const importCoachPage = () => import('@/pages/CoachPage');

export const DashboardPage = lazy(importDashboardPage);
export const HabitsPage = lazy(importHabitsPage);
export const ProgressPage = lazy(importProgressPage);
export const CoachPage = lazy(importCoachPage);
export const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * Loads every tab page, so that a first visit to a tab draws it at once, as a
 * native tab bar does, instead of showing a spinner while its code arrives.
 * A module loads once: the lazy components above reuse what this fetched.
 */
export function preloadPages(): Promise<unknown> {
  return Promise.all([
    importDashboardPage(),
    importHabitsPage(),
    importProgressPage(),
    importCoachPage(),
  ]);
}
