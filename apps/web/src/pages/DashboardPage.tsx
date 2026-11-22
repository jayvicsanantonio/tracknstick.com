import { usePageTitle } from '@shared/hooks/usePageTitle';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';

/**
 * Dashboard page component
 *
 * Route: / or /dashboard
 */
function DashboardPage() {
  usePageTitle('Dashboard');

  return (
    <section className="relative flex flex-1 flex-col">
      <h1 className="sr-only">Daily Habit Tracker</h1>
      <DailyHabitTracker />
    </section>
  );
}

export default DashboardPage;
