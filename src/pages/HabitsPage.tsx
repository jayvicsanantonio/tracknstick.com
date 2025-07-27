import { usePageTitle } from '@shared/hooks/usePageTitle';
import HabitsOverview from '@/features/habits/components/HabitsOverview';
import { useRouteMonitoring } from '@shared/utils/monitoring';

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
  useRouteMonitoring('/habits');

  return (
    <>
      <h1 className="sr-only">Habits Overview</h1>
      <HabitsOverview />
    </>
  );
}

export default HabitsPage;
