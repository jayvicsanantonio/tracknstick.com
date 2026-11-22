import { usePageTitle } from '@shared/hooks/usePageTitle';
import ProgressOverview from '@/features/progress/components/ProgressOverview';

/**
 * Progress page component
 *
 * This page displays the progress overview where users can view their habit
 * tracking progress and statistics over time.
 *
 * Route: /progress
 */
function ProgressPage() {
  usePageTitle('Progress Overview');

  return (
    // Shown at once, as a native app's tab is: no entrance animation.
    <section className="flex flex-1 flex-col">
      <h1 className="sr-only">Progress Overview</h1>
      <ProgressOverview />
    </section>
  );
}

export default ProgressPage;
