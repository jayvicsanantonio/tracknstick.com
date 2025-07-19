/**
 * Barrel export for all page components
 *
 * This file re-exports all page components for easier importing
 * throughout the application.
 */

export { DashboardPage } from './DashboardPage';
export { HabitsPage } from './HabitsPage';
export { ProgressPage } from './ProgressPage';
export { NotFoundPage } from './NotFoundPage';

// Also export as default exports for lazy loading
export { default as DashboardPageDefault } from './DashboardPage';
export { default as HabitsPageDefault } from './HabitsPage';
export { default as ProgressPageDefault } from './ProgressPage';
export { default as NotFoundPageDefault } from './NotFoundPage';
