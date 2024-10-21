import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Habit } from "@/types/habit";
import DailyHabitDate from "@/components/common/DailyHabitDate";
import DailyHabitProgressIndicator from "@/components/common/DailyHabitProgressIndicator";
import DailyHabitList from "@/components/common/DailyHabitList";

export default function DailyHabitTracker({
  isDarkMode,
  habits,
  setHabits,
}: {
  isDarkMode: boolean;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
}) {
  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);

  const completionRate = useMemo(() => {
    const completedHabits = habits.filter((habit) => habit.completed).length;
    return Math.round((completedHabits / habits.length) * 100);
  }, [habits]);

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          const newCompleted = !habit.completed;
          if (newCompleted) {
            setAnimatingHabitId(id);
            setTimeout(() => setAnimatingHabitId(null), 1000);
          }
          return { ...habit, completed: newCompleted };
        }
        return habit;
      })
    );
  };

  return (
    <Card
      className={
        isDarkMode ? "border-gray-700 bg-gray-800" : "border-purple-200"
      }
    >
      <CardHeader>
        <DailyHabitDate isDarkMode={isDarkMode} />
      </CardHeader>
      <CardContent>
        <DailyHabitProgressIndicator
          completionRate={completionRate}
          isDarkMode={isDarkMode}
        />
        <DailyHabitList
          isDarkMode={isDarkMode}
          habits={habits}
          toggleHabit={toggleHabit}
          animatingHabitId={animatingHabitId}
        />
      </CardContent>
    </Card>
  );
}
