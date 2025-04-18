import DailyHabitItem from "@/components/common/DailyHabitItem";
import { Habit } from "@/features/habits/types";
interface DailyHabitListProps {
  habits: Habit[];
  toggleHabit: (id: string) => Promise<void>;
  animatingHabitId: string | null;
}

export default function DailyHabitList({
  habits,
  toggleHabit,
  animatingHabitId,
}: DailyHabitListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {habits.map((habit) => (
        <DailyHabitItem
          key={habit.id}
          habit={habit}
          animatingHabitId={animatingHabitId}
          toggleHabit={toggleHabit}
        />
      ))}
    </div>
  );
}
