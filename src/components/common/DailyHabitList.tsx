import DailyHabitItem from "@/components/common/DailyHabitItem";
import { useHabits } from "@/features/habits/hooks/useHabits";

export default function DailyHabitList() {
  const { habits } = useHabits();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {habits.map((habit) => (
        <DailyHabitItem key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
