import { usePageTitle } from '@shared/hooks/usePageTitle';
import ProgressOverview from '@/features/progress/components/ProgressOverview';

/**
 * Progress page component
 *
 * Route: /progress
 */
function ProgressPage() {
  usePageTitle('Progress Overview');

  return (
    <section className="flex flex-1 flex-col">
      <h1 className="sr-only">Progress Overview</h1>
      <ProgressOverview />
    </section>
  );
}

export default ProgressPage;
