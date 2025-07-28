import { usePageTitle } from '@shared/hooks/usePageTitle';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';
import { useRouteMonitoring } from '@shared/utils/monitoring';

/**
 * Dashboard page component
 *
 * This is the default landing page for the application.
 * It displays the daily habit tracker where users can track their habits.
 *
 * Route: / or /dashboard
 */
export function DashboardPage() {
  usePageTitle('Dashboard');
  useRouteMonitoring('/');

  return (
    <>
      <h1 className="sr-only">Daily Habit Tracker</h1>
      <DailyHabitTracker />
    </>
  );
}

export default DashboardPage;
