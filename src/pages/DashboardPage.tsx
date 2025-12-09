import { usePageTitle } from '@shared/hooks/usePageTitle';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';
import { useRouteMonitoring } from '@shared/utils/monitoring';
import { motion } from 'framer-motion';

/**
 * Dashboard page component
 *
 * This is the default landing page for the application.
 * It displays the daily habit tracker where users can track their habits.
 *
 * Route: / or /dashboard
 */
function DashboardPage() {
  usePageTitle('Dashboard');
  useRouteMonitoring('/');

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative flex min-h-[calc(100vh-10rem)] flex-1 flex-col sm:min-h-[calc(100vh-14rem)]"
    >
      <div
        aria-hidden
        className="bg-(--color-brand-light) pointer-events-none absolute -top-6 left-6 -z-10 h-24 w-24 rounded-full opacity-30 blur-2xl"
      />
      <h1 className="sr-only">Daily Habit Tracker</h1>
      <DailyHabitTracker />
    </motion.section>
  );
}

export default DashboardPage;
