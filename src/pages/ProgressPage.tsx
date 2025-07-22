import { usePageTitle } from '@/hooks/usePageTitle';
import ProgressOverview from '@/features/progress/components/ProgressOverview';
import { useRouteMonitoring } from '@/utils/monitoring';

/**
 * Progress page component
 *
 * This page displays the progress overview where users can view their habit
 * tracking progress and statistics over time.
 *
 * Route: /progress
 */
export function ProgressPage() {
  usePageTitle('Progress Overview');
  useRouteMonitoring('/progress');

  return (
    <>
      <h1 className="sr-only">Progress Overview</h1>
      <ProgressOverview />
    </>
  );
}

export default ProgressPage;
