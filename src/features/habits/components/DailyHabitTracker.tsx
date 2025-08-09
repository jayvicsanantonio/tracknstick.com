import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import NoHabits from '@/features/habits/components/NoHabits';
import DailyHabitDate from '@/features/habits/components/DailyHabitDate';
import DailyHabitProgressIndicator from '@/features/habits/components/DailyHabitProgressIndicator';
import DailyHabitList from '@/features/habits/components/DailyHabitList';
import { useHabits } from '@/features/habits/hooks/useHabits';
import LoadingFallback from '@shared/components/feedback/LoadingFallback';
import { motion } from 'framer-motion';
// import { Skeleton } from '@shared/components/ui/skeleton';

export default function DailyHabitTracker() {
  const { habits, isLoading, error, completionRate } = useHabits();
  const isValidating = false; // SWR keep-previous UX placeholder; wire when available

  if (isLoading) {
    return (
      <motion.div
        className="flex h-full flex-1 flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8">
          <Card
            variant="glass"
            className="relative flex w-full flex-1 items-center justify-center overflow-hidden"
          >
            <CardContent className="px-3 py-12 sm:px-6">
              <LoadingFallback />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="border-(--color-error-light) bg-(--color-error-light) text-(--color-error-text) dark:border-(--color-error) dark:bg-(--color-error-light) dark:text-(--color-error-text) rounded-lg border p-8 text-center">
        Error loading habits. Please try again.
      </div>
    );
  }

  return (
    <motion.div
      className="flex h-full flex-1 flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8">
        <Card
          variant="glass"
          className="relative flex w-full flex-1 flex-col overflow-hidden"
        >
          <CardHeader className="px-3 pt-6 sm:px-6">
            <DailyHabitDate />
          </CardHeader>
          <CardContent className="flex-1 px-3 pb-8 sm:px-6">
            {habits.length === 0 ? (
              <NoHabits />
            ) : (
              <>
                <section
                  aria-label="Progress"
                  className="relative mx-auto mb-8 w-full max-w-md"
                >
                  {isValidating ? (
                    <div className="bg-(--color-surface)/50 absolute right-2 top-2 z-10 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs backdrop-blur-sm">
                      <span className="border-(--color-brand-primary) h-3 w-3 animate-spin rounded-full border-2 border-r-transparent"></span>
                      Refreshing…
                    </div>
                  ) : null}
                  <DailyHabitProgressIndicator
                    completionRate={completionRate}
                  />
                </section>
                <section aria-label="Today\'s Habits">
                  <DailyHabitList />
                </section>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
