import HabitsIcons from "@/icons/habits";
import { Button } from "@/components/ui/button";
import StarAnimation from "@/components/common/StarAnimation";
import { Habit } from "@/types/habit";
import frequencyLabel from "@/lib/frequencyLabel";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Edit } = MiscellaneousIcons;

export default function DailyHabitItem({
  habit,
  isDarkMode,
  isEditMode,
  animatingHabitId,
  toggleHabit,
  toggleIsEditingHabit,
  setEditingHabit,
}: {
  habit: Habit;
  isDarkMode: boolean;
  isEditMode: boolean;
  animatingHabitId: string | null;
  toggleHabit: (id: string) => Promise<void>;
  toggleIsEditingHabit: () => void;
  setEditingHabit: (habit: Habit | null) => void;
}) {
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
          } transition duration-300 ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 focus:outline-none ${
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
        {isEditMode && (
          <Button
            className={`absolute top-0 right-0 rounded-full w-8 h-8 p-0 ${
              isDarkMode
                ? "bg-purple-700 hover:bg-purple-600"
                : "bg-purple-400 hover:bg-purple-500"
            }`}
            onClick={() => {
              setEditingHabit(habit);
              toggleIsEditingHabit();
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
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
}
