import { usePageTitle } from '@shared/hooks/usePageTitle';
import LargeTitle from '@shared/components/layouts/LargeTitle';
import { pageTitleFor } from '@app/routes/pageTitles';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';

/**
 * Dashboard page component
 *
 * This is the default landing page for the application.
 * It displays the daily habit tracker where users can track their habits.
 *
 * Route: / or /dashboard
 */
function DashboardPage() {
  usePageTitle('Dashboard');

  return (
    // Shown at once, as a native app's tab is: no entrance animation.
    <section className="relative flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 left-6 -z-10 h-24 w-24 rounded-full bg-(--color-brand-light) opacity-30 blur-2xl"
      />
      <LargeTitle>{pageTitleFor('/')}</LargeTitle>
      <DailyHabitTracker />
    </section>
  );
}

export default DashboardPage;
