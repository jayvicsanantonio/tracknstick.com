import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import NoHabits from '@/features/habits/components/NoHabits';
import DailyHabitDate from '@/features/habits/components/DailyHabitDate';
import DailyHabitProgressIndicator from '@/features/habits/components/DailyHabitProgressIndicator';
import DailyHabitList from '@/features/habits/components/DailyHabitList';
import { useHabits } from '@/features/habits/hooks/useHabits';
import LoadingFallback from '@shared/components/feedback/LoadingFallback';
import { motion } from 'framer-motion';

export default function DailyHabitTracker() {
  const { habits, isLoading, error, completionRate } = useHabits();

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
