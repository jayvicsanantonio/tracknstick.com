import { usePageTitle } from '@shared/hooks/usePageTitle';
import LargeTitle from '@shared/components/layouts/LargeTitle';
import { pageTitleFor } from '@app/routes/pageTitles';
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
      <LargeTitle>{pageTitleFor('/progress')}</LargeTitle>
      <ProgressOverview />
    </section>
  );
}

export default ProgressPage;
