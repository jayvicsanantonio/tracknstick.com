import { useContext } from "react";
import { Habit } from "@/features/habits/types/Habit";
import { ThemeContext } from "@/context/ThemeContext";
import formatDate from "@/lib/formatDate";
import MiscellaneousIcons from "@/icons/miscellaneous";
import useHabitStats from "@/features/habits/hooks/useHabitStats";
import { motion } from "framer-motion";

const { Trophy, Calendar, CheckCircle2, Award } = MiscellaneousIcons;

export default function HabitStats({ habit }: { habit: Habit | null }) {
  const habitStats = useHabitStats(habit?.id ?? "");
  const { isDarkMode } = useContext(ThemeContext);

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
          className={`rounded-lg ${isDarkMode ? "bg-gray-700/70" : "bg-white"} p-4 sm:p-6 shadow-md flex flex-col items-center justify-center text-center space-y-2 border ${isDarkMode ? "border-gray-600" : "border-purple-100"}`}
        >
          <div
            className={`rounded-full p-2 sm:p-3 ${isDarkMode ? "bg-gray-600/60" : "bg-purple-100/60"}`}
          >
            <Trophy
              className={`w-8 h-8 sm:w-10 sm:h-10 ${
                isDarkMode ? "text-yellow-500" : "text-yellow-600"
              }`}
            />
          </div>
          <h3
            className={`font-medium text-sm sm:text-base ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
          >
            Current Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span
              className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? "text-purple-200" : "text-purple-800"}`}
            >
              {habitStats.streak}
            </span>
            <span
              className={`ml-1 text-xs sm:text-sm ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
            >
              days
            </span>
          </div>
        </motion.div>

        {/* Longest Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`rounded-lg ${isDarkMode ? "bg-gray-700/70" : "bg-white"} p-4 sm:p-6 shadow-md flex flex-col items-center justify-center text-center space-y-2 border ${isDarkMode ? "border-gray-600" : "border-purple-100"}`}
        >
          <div
            className={`rounded-full p-2 sm:p-3 ${isDarkMode ? "bg-gray-600/60" : "bg-purple-100/60"}`}
          >
            <Award
              className={`w-8 h-8 sm:w-10 sm:h-10 ${
                isDarkMode ? "text-purple-400" : "text-purple-600"
              }`}
            />
          </div>
          <h3
            className={`font-medium text-sm sm:text-base ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
          >
            Longest Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span
              className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? "text-purple-200" : "text-purple-800"}`}
            >
              {habitStats.longestStreak}
            </span>
            <span
              className={`ml-1 text-xs sm:text-sm ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
            >
              days
            </span>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="mt-2">
        <div
          className={`rounded-lg ${isDarkMode ? "bg-gray-700/70" : "bg-white"} p-4 sm:p-5 shadow-md space-y-4 border ${isDarkMode ? "border-gray-600" : "border-purple-100"}`}
        >
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex justify-between items-center"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`rounded-full p-1.5 ${isDarkMode ? "bg-gray-600/60" : "bg-purple-100/60"}`}
              >
                <CheckCircle2
                  className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                />
              </div>
              <span
                className={`text-sm sm:text-base ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
              >
                Total Completions
              </span>
            </div>
            <span
              className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? "text-purple-200" : "text-purple-800"}`}
            >
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
                className={`rounded-full p-1.5 ${isDarkMode ? "bg-gray-600/60" : "bg-purple-100/60"}`}
              >
                <Calendar
                  className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`}
                />
              </div>
              <span
                className={`text-sm sm:text-base ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
              >
                Last Completed
              </span>
            </div>
            <span
              className={`text-sm sm:text-base font-medium ${isDarkMode ? "text-purple-200" : "text-purple-800"}`}
            >
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
        className={`mt-2 text-center rounded-lg ${isDarkMode ? "bg-purple-900/20" : "bg-purple-50"} p-4 border ${isDarkMode ? "border-purple-800/30" : "border-purple-200/70"}`}
      >
        <p
          className={`text-xs sm:text-sm ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}
        >
          {habitStats.streak > 0
            ? `Great job! You've been consistent with "${habit.name}" for ${habitStats.streak} days.`
            : `Start your streak by completing "${habit.name}" today!`}
        </p>
      </motion.div>
    </div>
  );
}
