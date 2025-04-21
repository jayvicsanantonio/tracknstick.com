import { useContext, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import NoHabits from "@/components/common/NoHabits";
import DailyHabitDate from "@/components/common/DailyHabitDate";
import DailyHabitProgressIndicator from "@/components/common/DailyHabitProgressIndicator";
import DailyHabitList from "@/components/common/DailyHabitList";
import { ThemeContext } from "@/context/ThemeContext";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useHabitsState } from "@/features/habits/context/HabitsStateContext";

export default function DailyHabitTracker() {
  const { isDarkMode } = useContext(ThemeContext);
  const { habits, isLoading, error } = useHabits();
  const { toggleShowAddHabitDialog } = useHabitsState();

  const completionRate = useMemo(() => {
    const completedHabits = habits.filter((habit) => habit.completed).length;
    const totalHabits = habits.length;
    return totalHabits > 0
      ? Math.round((completedHabits / totalHabits) * 100)
      : 0;
  }, [habits]);

  if (isLoading) {
    return <div>Loading habits...</div>;
  }

  if (error) {
    return <div>Error loading habits. Please try again.</div>;
  }

  return (
    <div className="flex-1">
      <Card
        className={`min-w-[400px] ${
          isDarkMode ? "border-gray-700 bg-gray-800" : "border-purple-200"
        }
      `}
      >
        <CardHeader>
          <DailyHabitDate />
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <NoHabits onAddHabitClick={toggleShowAddHabitDialog} />
          ) : (
            <>
              <DailyHabitProgressIndicator completionRate={completionRate} />
              <DailyHabitList />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
