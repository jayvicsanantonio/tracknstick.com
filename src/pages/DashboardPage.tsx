import { usePageTitle } from '@/hooks/usePageTitle';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';

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

  return (
    <>
      <h1 className="sr-only">Daily Habit Tracker</h1>
      <DailyHabitTracker />
    </>
  );
}

export default DashboardPage;
