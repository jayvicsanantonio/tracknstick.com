import { usePageTitle } from '@/hooks/usePageTitle';
import HabitsOverview from '@/features/habits/components/HabitsOverview';

/**
 * Habits page component
 *
 * This page displays the habits overview where users can manage their habits.
 * Users can add, edit, delete, and reorder their habits from this view.
 *
 * Route: /habits
 */
export function HabitsPage() {
  usePageTitle('Habits Overview');

  return (
    <>
      <h1 className="sr-only">Habits Overview</h1>
      <HabitsOverview />
    </>
  );
}

export default HabitsPage;
