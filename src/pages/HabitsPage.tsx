import { usePageTitle } from '@shared/hooks/usePageTitle';
import HabitsOverview from '@/features/habits/components/HabitsOverview';
import { useRouteMonitoring } from '@shared/utils/monitoring';
import { motion } from 'framer-motion';

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
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h1 className="sr-only">Habits Overview</h1>
      <HabitsOverview />
    </motion.section>
  );
}

export default HabitsPage;
