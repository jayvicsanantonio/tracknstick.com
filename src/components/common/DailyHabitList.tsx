import DailyHabitItem from "@/components/common/DailyHabitItem";
import { DailyHabitListProps } from "@/types/dailyhabitlist";

export default function DailyHabitList({
  isDarkMode,
  isEditMode,
  habits,
  toggleHabit,
  animatingHabitId,
  toggleIsEditingHabit,
  setEditingHabit,
}: DailyHabitListProps) {
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
