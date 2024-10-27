import { Habit } from "@/types/habit";
import formatDate from "@/lib/formatDate";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Trophy } = MiscellaneousIcons;

export default function HabitStats({
  habit,
  isDarkMode,
}: {
  habit: Habit | null;
  isDarkMode: boolean;
}) {
  if (!habit) return null;

  return (
    <div className="space-y-6" role="group" aria-label="Habit Statistics">
      <div className="flex items-center justify-between">
        <span className={isDarkMode ? "text-purple-300" : "text-purple-700"}>
          Current Streak
        </span>
        <div className="flex items-center">
          <Trophy
            className={`w-6 h-6 mr-2 ${
              isDarkMode ? "text-yellow-500" : "text-yellow-600"
            }`}
          />
          <span
            className={`text-3xl font-bold ${
              isDarkMode ? "text-purple-200" : "text-purple-800"
            }`}
          >
            {habit.stats.streak}
          </span>
          <span
            className={`ml-1 text-sm ${
              isDarkMode ? "text-purple-400" : "text-purple-600"
            }`}
          >
            days
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={isDarkMode ? "text-purple-300" : "text-purple-700"}>
            Total Completions
          </span>
          <span
            className={`text-2xl font-semibold ${
              isDarkMode ? "text-purple-200" : "text-purple-800"
            }`}
          >
            {habit.stats.totalCompletions}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={isDarkMode ? "text-purple-300" : "text-purple-700"}>
          Last Completed
        </span>
        <span
          className={`font-semibold ${
            isDarkMode ? "text-purple-200" : "text-purple-800"
          }`}
        >
          {formatDate(habit.stats.lastCompleted)}
        </span>
      </div>
    </div>
  );
}
