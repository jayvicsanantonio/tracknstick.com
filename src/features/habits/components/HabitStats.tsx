import { Habit } from "@/features/habits/types/Habit";
import formatDate from "@/lib/formatDate";
import MiscellaneousIcons from "@/icons/miscellaneous";
import useHabitStats from "@/features/habits/hooks/useHabitStats";
import { motion } from "framer-motion";

const { Trophy, Calendar, CheckCircle2, Award } = MiscellaneousIcons;

export default function HabitStats({ habit }: { habit: Habit | null }) {
  const habitStats = useHabitStats(habit?.id ?? "");

  if (!habit) return null;

  return (
    <div
      className="min-h-fit max-h-[70vh] sm:max-h-none sm:h-auto overflow-y-auto grid gap-3 sm:gap-4 py-2 sm:py-4"
      aria-label="Habit Statistics"
    >
      {/* Streak Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Current Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg bg-white dark:bg-purple-900/50 p-4 sm:p-6 shadow-md flex flex-col items-center justify-center text-center space-y-2 border border-purple-100 dark:border-purple-900"
        >
          <div
            aria-hidden="true"
            className="rounded-full p-2 sm:p-3 bg-purple-100/60 dark:bg-purple-800/60"
          >
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h3 className="font-medium text-sm sm:text-base text-purple-700 dark:text-purple-300">
            Current Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl sm:text-4xl font-bold text-purple-800 dark:text-purple-300">
              {habitStats.streak}
            </span>
            <span className="ml-1 text-xs sm:text-sm text-purple-600 dark:text-purple-400">
              days
            </span>
          </div>
        </motion.div>

        {/* Longest Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-lg bg-white dark:bg-purple-900/50 p-4 sm:p-6 shadow-md flex flex-col items-center justify-center text-center space-y-2 border border-purple-100 dark:border-purple-900"
        >
          <div
            aria-hidden="true"
            className="rounded-full p-2 sm:p-3 bg-purple-100/60 dark:bg-purple-800/60"
          >
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-500" />
          </div>
          <h3 className="font-medium text-sm sm:text-base text-purple-700 dark:text-purple-300">
            Longest Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl sm:text-4xl font-bold text-purple-800 dark:text-purple-300">
              {habitStats.longestStreak}
            </span>
            <span className="ml-1 text-xs sm:text-sm text-purple-600 dark:text-purple-400">
              days
            </span>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="mt-2">
        <div className="rounded-lg bg-white dark:bg-purple-900/50 p-4 sm:p-5 shadow-md space-y-4 border border-purple-100 dark:border-purple-900">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex justify-between items-center"
          >
            <div className="flex items-center space-x-3">
              <div
                aria-hidden="true"
                className="rounded-full p-1.5 bg-purple-100/60 dark:bg-purple-800/60"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <span className="text-sm sm:text-base text-purple-700 dark:text-purple-300">
                Total Completions
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-purple-800 dark:text-purple-300">
              {habitStats.totalCompletions}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex justify-between items-center"
          >
            <div className="flex items-center space-x-3">
              <div
                aria-hidden="true"
                className="rounded-full p-1.5 bg-purple-100/60 dark:bg-purple-800/60"
              >
                <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <span className="text-sm sm:text-base text-purple-700 dark:text-purple-300">
                Last Completed
              </span>
            </div>
            <span className="text-sm sm:text-base font-medium text-purple-800 dark:text-purple-300">
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
        className="mt-2 text-center rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4 border border-purple-200/70 dark:border-purple-900/30"
      >
        <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">
          {habitStats.streak > 0
            ? `Great job! You've been consistent with "${habit.name}" for ${habitStats.streak} days.`
            : `Start your streak by completing "${habit.name}" today!`}
        </p>
      </motion.div>
    </div>
  );
}
