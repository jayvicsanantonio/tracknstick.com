import { usePageTitle } from '@shared/hooks/usePageTitle';
import HabitsOverview from '@/features/habits/components/HabitsOverview';

/**
 * Habits page component
 *
 * Route: /habits
 */
function HabitsPage() {
  usePageTitle('Habits Overview');

  return (
    <section className="flex flex-1 flex-col">
      <h1 className="sr-only">Habits Overview</h1>
      <HabitsOverview />
    </section>
  );
}

export default HabitsPage;
