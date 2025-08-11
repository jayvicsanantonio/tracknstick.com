import { usePageTitle } from '@shared/hooks/usePageTitle';
import ProgressOverview from '@/features/progress/components/ProgressOverview';
import { useRouteMonitoring } from '@shared/utils/monitoring';
import { motion } from 'framer-motion';

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
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex min-h-[calc(100vh-10rem)] flex-1 flex-col sm:min-h-[calc(100vh-14rem)]"
    >
      <h1 className="sr-only">Progress Overview</h1>
      <ProgressOverview />
    </motion.section>
  );
}

export default ProgressPage;
