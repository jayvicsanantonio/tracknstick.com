import { useContext } from "react";
import HabitsIcons from "@/icons/habits";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/context/ThemeContext";
import StarAnimation from "@/components/ui/animations/StarAnimation";
import { Habit } from "@/features/habits/types/Habit";
import frequencyLabel from "@/lib/frequencyLabel";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";
import { useHabits } from "@/features/habits/hooks/useHabits";

const { Edit } = MiscellaneousIcons;

interface DailyHabitItemProps {
  habit: Habit;
}

export default function DailyHabitItem({ habit }: DailyHabitItemProps) {
  const { isDarkMode } = useContext(ThemeContext);
  const { isEditMode, openEditDialog } = useHabitsContext();
  const { toggleHabit, animatingHabitId } = useHabits();
  const Icon = HabitsIcons[habit.icon];

  return (
    <div key={habit.id} className="flex flex-col items-center group">
      <div className="relative mb-3">
        <div
          className={`absolute -inset-1 rounded-full blur-sm opacity-0 group-hover:opacity-70 transition-opacity duration-300 
          ${
            habit.completed
              ? isDarkMode
                ? "bg-purple-600/30"
                : "bg-purple-500/30"
              : isDarkMode
                ? "bg-purple-600/20"
                : "bg-purple-400/20"
          }`}
        ></div>
        <button
          className={`cursor-pointer relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shadow-md border-2
            ${
              habit.completed
                ? isDarkMode
                  ? "bg-gradient-to-br from-purple-600 to-purple-500 shadow-purple-600/30 border-none"
                  : "bg-gradient-to-br from-purple-600 to-purple-500 shadow-purple-500/30 border-none"
                : isDarkMode
                  ? "bg-[#121228] shadow-gray-900/20 hover:bg-gray-750 border-purple-500"
                  : "bg-white shadow-purple-300/40 hover:bg-purple-50 border-purple-600"
            } 
            transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95`}
          onClick={() => {
            if (habit.id) {
              toggleHabit(habit.id).catch((error) => {
                console.error("Failed to toggle habit:", error);
              });
            }
          }}
        >
          <Icon
            className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 transition-colors
              ${
                habit.completed
                  ? "text-white"
                  : isDarkMode
                    ? "text-purple-500"
                    : "text-purple-600"
              }`}
          />
          <StarAnimation isVisible={animatingHabitId === habit.id} />
        </button>
        {isEditMode && (
          <Button
            className={`absolute -top-1 -right-1 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0 
              ${
                isDarkMode
                  ? "bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30"
                  : "bg-purple-500 hover:bg-purple-400 shadow-md shadow-purple-500/30"
              } transition-all duration-300 z-10`}
            onClick={() => openEditDialog(habit)}
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </Button>
        )}
      </div>
      <span
        className={`text-xs sm:text-sm font-semibold text-center ${
          isDarkMode ? "text-purple-300" : "text-purple-800"
        } line-clamp-1 max-w-full px-1`}
      >
        {habit.name}
      </span>
      <span
        className={`text-xs ${
          isDarkMode ? "text-purple-400" : "text-purple-600/80"
        } mt-0.5`}
      >
        {frequencyLabel(habit.frequency)}
      </span>
    </div>
  );
}
