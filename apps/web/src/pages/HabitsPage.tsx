import { usePageTitle } from '@shared/hooks/usePageTitle';
import HabitsOverview from '@/features/habits/components/HabitsOverview';

/**
 * Habits page component
 *
 * This page displays the habits overview where users can manage their habits.
 * Users can add, edit, delete, and reorder their habits from this view.
 *
 * Route: /habits
 */
function HabitsPage() {
  usePageTitle('Habits Overview');

  return (
    // Shown at once, as a native app's tab is: no entrance animation.
    <section className="flex flex-1 flex-col">
      <h1 className="sr-only">Habits Overview</h1>
      <HabitsOverview />
    </section>
  );
}

export default HabitsPage;
