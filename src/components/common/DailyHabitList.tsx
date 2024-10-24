import DailyHabitItem from "@/components/common/DailyHabitItem";
import { Habit } from "@/types/habit";

export default function DailyHabitList({
  isDarkMode,
  isEditMode,
  habits,
  toggleHabit,
  animatingHabitId,
  toggleIsEditingHabit,
  setEditingHabit,
}: {
  isDarkMode: boolean;
  isEditMode: boolean;
  habits: Habit[];
  toggleHabit: (id: string) => Promise<void>;
  animatingHabitId: string | null;
  toggleIsEditingHabit: () => void;
  setEditingHabit: (habit: Habit | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {habits.map((habit) => (
        <DailyHabitItem
          key={habit.id}
          habit={habit}
          isDarkMode={isDarkMode}
          isEditMode={isEditMode}
          animatingHabitId={animatingHabitId}
          toggleHabit={toggleHabit}
          toggleIsEditingHabit={toggleIsEditingHabit}
          setEditingHabit={setEditingHabit}
        />
      ))}
    </div>
  );
}
