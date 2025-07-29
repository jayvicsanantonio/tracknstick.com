import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import NoHabits from '@/features/habits/components/NoHabits';
import DailyHabitDate from '@/features/habits/components/DailyHabitDate';
import DailyHabitProgressIndicator from '@/features/habits/components/DailyHabitProgressIndicator';
import DailyHabitList from '@/features/habits/components/DailyHabitList';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { motion } from 'framer-motion';
import { HabitListSkeleton, Skeleton } from '@shared/components/ui/skeleton';

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
        <Card className="border-(--color-border-brand) bg-(--color-surface) shadow-(--color-border-brand)/50 dark:border-(--color-border-brand) dark:bg-(--color-surface)/10 dark:shadow-(--color-border-brand)/20 flex w-full flex-1 flex-col overflow-hidden shadow-xl">
          <CardHeader className="px-3 pt-6 sm:px-6">
            <Skeleton className="mx-auto h-8 w-48" />
          </CardHeader>
          <CardContent className="flex-1 px-3 pb-8 sm:px-6">
            <div className="mb-6">
              <Skeleton className="mx-auto mb-2 h-6 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
            <HabitListSkeleton />
          </CardContent>
        </Card>
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
      <Card className="border-(--color-border-brand) bg-(--color-surface) shadow-(--color-border-brand)/50 dark:border-(--color-border-brand) dark:bg-(--color-surface)/10 dark:shadow-(--color-border-brand)/20 flex w-full flex-1 flex-col overflow-hidden shadow-xl">
        <CardHeader className="px-3 pt-6 sm:px-6">
          <DailyHabitDate />
        </CardHeader>
        <CardContent className="flex-1 px-3 pb-8 sm:px-6">
          {habits.length === 0 ? (
            <NoHabits />
          ) : (
            <>
              <DailyHabitProgressIndicator completionRate={completionRate} />
              <DailyHabitList />
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
