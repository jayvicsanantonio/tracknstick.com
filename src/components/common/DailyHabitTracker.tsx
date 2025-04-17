import { useContext, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Habit } from "@/types/habit";
import NoHabits from "@/components/common/NoHabits";
import DailyHabitDate from "@/components/common/DailyHabitDate";
import DailyHabitProgressIndicator from "@/components/common/DailyHabitProgressIndicator";
import DailyHabitList from "@/components/common/DailyHabitList";
import { ThemeContext } from "@/context/ThemeContext";
import toggleOnSound from "@/assets/audio/habit-toggled-on.mp3";
import toggleOffSound from "@/assets/audio/habit-toggled-off.mp3";
import completedAllHabits from "@/assets/audio/completed-all-habits.mp3";
import { useHabits } from "@/features/habits/hooks/useHabits";

export default function DailyHabitTracker({
  isEditMode,
  toggleIsEditingHabit,
  setEditingHabit,
  onAddHabitClick,
}: {
  isEditMode: boolean;
  toggleIsEditingHabit: () => void;
  setEditingHabit: (habit: Habit | null) => void;
  onAddHabitClick: () => void;
}) {
  const { isDarkMode } = useContext(ThemeContext);
  const {
    habits,
    isLoading,
    error,
    toggleHabit: toggleHabitCompletion,
  } = useHabits();

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const completionRate = useMemo(() => {
    const completedHabits = habits.filter((habit) => habit.completed).length;
    const totalHabits = habits.length;
    return totalHabits > 0
      ? Math.round((completedHabits / totalHabits) * 100)
      : 0;
  }, [habits]);

  const handleToggleHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (habit && !habit.completed) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setAnimatingHabitId(id);
      const newTimeoutId = setTimeout(() => setAnimatingHabitId(null), 1000);
      setTimeoutId(newTimeoutId);
    }

    await toggleHabitCompletion(id);

    const allHabitsCompleted =
      habits.filter((h) => h.completed).length === habits.length - 1 &&
      !habit?.completed;

    if (allHabitsCompleted) {
      const audio = new Audio(completedAllHabits);
      await audio.play();
    } else {
      const audio = !habit?.completed
        ? new Audio(toggleOnSound)
        : new Audio(toggleOffSound);
      await audio.play();
    }
  };

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
            <NoHabits onAddHabitClick={onAddHabitClick} />
          ) : (
            <>
              <DailyHabitProgressIndicator completionRate={completionRate} />
              <DailyHabitList
                isEditMode={isEditMode}
                habits={habits}
                toggleHabit={handleToggleHabit}
                animatingHabitId={animatingHabitId}
                toggleIsEditingHabit={toggleIsEditingHabit}
                setEditingHabit={setEditingHabit}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
