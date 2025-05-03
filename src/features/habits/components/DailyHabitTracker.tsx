import { useContext } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import NoHabits from "@/features/habits/components/NoHabits";
import DailyHabitDate from "@/features/habits/components/DailyHabitDate";
import DailyHabitProgressIndicator from "@/features/habits/components/DailyHabitProgressIndicator";
import DailyHabitList from "@/features/habits/components/DailyHabitList";
import { ThemeContext } from "@/context/ThemeContext";
import { useHabits } from "@/features/habits/hooks/useHabits";

export default function DailyHabitTracker() {
  const { isDarkMode } = useContext(ThemeContext);
  const { habits, isLoading, error, completionRate } = useHabits();

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
            <NoHabits />
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
