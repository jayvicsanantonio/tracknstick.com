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
          className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-purple-100 bg-white p-4 text-center shadow-md sm:p-6 dark:border-purple-900 dark:bg-purple-900/50"
        >
          <div
            aria-hidden="true"
            className="rounded-full bg-purple-100/60 p-2 sm:p-3 dark:bg-purple-800/60"
          >
            <Trophy className="h-8 w-8 text-yellow-600 sm:h-10 sm:w-10 dark:text-yellow-500" />
          </div>
          <h3 className="text-sm font-medium text-purple-700 sm:text-base dark:text-purple-300">
            Current Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-bold text-purple-800 sm:text-4xl dark:text-purple-300">
              {habitStats.streak}
            </span>
            <span className="ml-1 text-xs text-purple-600 sm:text-sm dark:text-purple-400">
              days
            </span>
          </div>
        </motion.div>

        {/* Longest Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-purple-100 bg-white p-4 text-center shadow-md sm:p-6 dark:border-purple-900 dark:bg-purple-900/50"
        >
          <div
            aria-hidden="true"
            className="rounded-full bg-purple-100/60 p-2 sm:p-3 dark:bg-purple-800/60"
          >
            <Award className="h-8 w-8 text-purple-600 sm:h-10 sm:w-10 dark:text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-purple-700 sm:text-base dark:text-purple-300">
            Longest Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-bold text-purple-800 sm:text-4xl dark:text-purple-300">
              {habitStats.longestStreak}
            </span>
            <span className="ml-1 text-xs text-purple-600 sm:text-sm dark:text-purple-400">
              days
            </span>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="mt-2">
        <div className="space-y-4 rounded-lg border border-purple-100 bg-white p-4 shadow-md sm:p-5 dark:border-purple-900 dark:bg-purple-900/50">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div
                aria-hidden="true"
                className="rounded-full bg-purple-100/60 p-1.5 dark:bg-purple-800/60"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
              <span className="text-sm text-purple-700 sm:text-base dark:text-purple-300">
                Total Completions
              </span>
            </div>
            <span className="text-xl font-semibold text-purple-800 sm:text-2xl dark:text-purple-300">
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
                className="rounded-full bg-purple-100/60 p-1.5 dark:bg-purple-800/60"
              >
                <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <span className="text-sm text-purple-700 sm:text-base dark:text-purple-300">
                Last Completed
              </span>
            </div>
            <span className="text-sm font-medium text-purple-800 sm:text-base dark:text-purple-300">
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
        className="mt-2 rounded-lg border border-purple-200/70 bg-purple-50 p-4 text-center dark:border-purple-900/30 dark:bg-purple-900/20"
      >
        <p className="text-xs text-purple-600 sm:text-sm dark:text-purple-400">
          {motivationalMessage}
        </p>
      </motion.div>
    </div>
  );
});

export default HabitStats;
