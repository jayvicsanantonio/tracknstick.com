import { memo, useMemo } from 'react';
import { Habit } from '@/features/habits/types/Habit';
import formatDate from '@shared/utils/date/formatDate';
import MiscellaneousIcons from '@/icons/miscellaneous';
import useHabitStats from '@/features/habits/hooks/useHabitStats';
import { motion } from 'framer-motion';

const { Trophy, Calendar, CheckCircle2, Award } = MiscellaneousIcons;

interface HabitStatsProps {
  habit: Habit | null;
}

const HabitStats = memo(function HabitStats({ habit }: HabitStatsProps) {
  const habitStats = useHabitStats(habit?.id ?? '');

  const motivationalMessage = useMemo(() => {
    if (!habit) return '';
    return habitStats.streak > 0
      ? `Great job! You've been consistent with "${habit.name}" for ${habitStats.streak} days.`
      : `Start your streak by completing "${habit.name}" today!`;
  }, [habit, habitStats.streak]);

  if (!habit) return null;

  return (
    <div
      className="grid max-h-[70vh] min-h-fit gap-3 overflow-y-auto py-2 sm:h-auto sm:max-h-none sm:gap-4 sm:py-4"
      aria-label="Habit Statistics"
    >
      {/* Streak Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {/* Current Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border-(--color-border-primary) bg-(--color-card) flex flex-col items-center justify-center space-y-2 rounded-lg border p-4 text-center shadow-md sm:p-6"
        >
          <div
            aria-hidden="true"
            className="bg-(--color-brand-light) rounded-full p-2 sm:p-3"
          >
            <Trophy className="text-(--color-brand-primary) h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h3 className="text-(--color-brand-text) text-sm font-medium sm:text-base">
            Current Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-(--color-brand-text) text-3xl font-bold sm:text-4xl">
              {habitStats.streak}
            </span>
            <span className="text-(--color-text-secondary) ml-1 text-xs sm:text-sm">
              days
            </span>
          </div>
        </motion.div>

        {/* Longest Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border-(--color-border-primary) bg-(--color-card) flex flex-col items-center justify-center space-y-2 rounded-lg border p-4 text-center shadow-md sm:p-6"
        >
          <div
            aria-hidden="true"
            className="bg-(--color-brand-light) rounded-full p-2 sm:p-3"
          >
            <Award className="text-(--color-brand-primary) h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h3 className="text-(--color-brand-text) text-sm font-medium sm:text-base">
            Longest Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-(--color-brand-text) text-3xl font-bold sm:text-4xl">
              {habitStats.longestStreak}
            </span>
            <span className="text-(--color-text-secondary) ml-1 text-xs sm:text-sm">
              days
            </span>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="mt-2">
        <div className="border-(--color-border-primary) bg-(--color-card) space-y-4 rounded-lg border p-4 shadow-md sm:p-5">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div
                aria-hidden="true"
                className="bg-(--color-brand-light) rounded-full p-1.5"
              >
                <CheckCircle2 className="text-(--color-brand-primary) h-5 w-5" />
              </div>
              <span className="text-(--color-brand-text) text-sm sm:text-base">
                Total Completions
              </span>
            </div>
            <span className="text-(--color-brand-text) text-xl font-semibold sm:text-2xl">
              {habitStats.totalCompletions}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div
                aria-hidden="true"
                className="bg-(--color-brand-light) rounded-full p-1.5"
              >
                <Calendar className="text-(--color-brand-primary) h-5 w-5" />
              </div>
              <span className="text-(--color-brand-text) text-sm sm:text-base">
                Last Completed
              </span>
            </div>
            <span className="text-(--color-brand-text) text-sm font-medium sm:text-base">
              {formatDate(habitStats?.lastCompleted)}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Consistency message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="border-(--color-border-primary) bg-(--color-surface-secondary) mt-2 rounded-lg border p-4 text-center"
      >
        <p className="text-(--color-text-secondary) text-xs sm:text-sm">
          {motivationalMessage}
        </p>
      </motion.div>
    </div>
  );
});

export default HabitStats;
