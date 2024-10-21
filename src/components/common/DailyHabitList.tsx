import StarAnimation from "@/components/common/StarAnimation";
import HabitsIcons from "@/icons/habits";
import { Habit } from "@/types/habit";
import { Frequency } from "@/types/frequency";

export default function DailyHabitList({
  isDarkMode,
  habits,
  toggleHabit,
  animatingHabitId,
}: {
  isDarkMode: boolean;
  habits: Habit[];
  toggleHabit: (id: string) => void;
  animatingHabitId: string | null;
}) {
  const frequencyLabel = (frequency: Frequency[]) => {
    if (frequency.length === 7) {
      return "Daily";
    }

    if (frequency.length === 1) {
      return "Weekly";
    }

    return `${frequency.length}x a week`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {habits.map((habit) => {
        const Icon = HabitsIcons[habit.icon];
        return (
          <div key={habit.id} className="flex flex-col items-center">
            <div className="relative mb-2">
              <button
                className={`relative flex items-center justify-center w-28 h-28 rounded-full ${
                  habit.completed
                    ? isDarkMode
                      ? "bg-purple-700"
                      : "bg-purple-600"
                    : isDarkMode
                    ? "bg-gray-700"
                    : "bg-purple-200"
                } transition-colors duration-200 focus:outline-none focus:ring-2 ${
                  isDarkMode ? "focus:ring-purple-400" : "focus:ring-purple-600"
                } focus:ring-opacity-50`}
                onClick={() => toggleHabit(habit.id)}
              >
                <Icon
                  className={`h-14 w-14 ${
                    habit.completed
                      ? "text-white"
                      : isDarkMode
                      ? "text-purple-400"
                      : "text-purple-600"
                  }`}
                />
                <StarAnimation isVisible={animatingHabitId === habit.id} />
              </button>
              {/* {isEditMode && (
                <Button
                  className={`absolute top-0 right-0 rounded-full w-8 h-8 p-0 ${
                    isDarkMode
                      ? "bg-purple-700 hover:bg-purple-600"
                      : "bg-purple-400 hover:bg-purple-500"
                  }`}
                  onClick={() => {
                    setEditingHabit(habit);
                    setIsEditingHabit(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )} */}
            </div>
            <span
              className={`text-sm font-medium ${
                isDarkMode ? "text-purple-200" : "text-purple-800"
              }`}
            >
              {habit.name}
            </span>
            <span
              className={`text-xs ${
                isDarkMode ? "text-purple-300" : "text-purple-600"
              }`}
            >
              {frequencyLabel(habit.frequency)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
