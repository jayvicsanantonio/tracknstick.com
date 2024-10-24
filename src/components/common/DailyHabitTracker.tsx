import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Habit } from "@/types/habit";
import DailyHabitDate from "@/components/common/DailyHabitDate";
import DailyHabitProgressIndicator from "@/components/common/DailyHabitProgressIndicator";
import DailyHabitList from "@/components/common/DailyHabitList";
import toggleOnSound from "@/assets/audio/habit-toggled-on.mp3";
import toggleOffSound from "@/assets/audio/habit-toggled-off.mp3";
import completedAllHabits from "@/assets/audio/completed-all-habits.mp3";

export default function DailyHabitTracker({
  isDarkMode,
  isEditMode,
  habits,
  setHabits,
  toggleIsEditingHabit,
  setEditingHabit,
}: {
  isDarkMode: boolean;
  isEditMode: boolean;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  toggleIsEditingHabit: () => void;
  setEditingHabit: (habit: Habit | null) => void;
}) {
  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);

  const completionRate = useMemo(() => {
    const completedHabits = habits.filter((habit) => habit.completed).length;
    return Math.round((completedHabits / habits.length) * 100);
  }, [habits]);

  const toggleHabit = async (id: string) => {
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

    const habit = habits.find((habit) => habit.id === id);
    const allHabitsCompleted =
      habits.filter((habit) => habit.completed).length === habits.length - 1 &&
      !habit?.completed;

    if (allHabitsCompleted) {
      const audio = new Audio(completedAllHabits);
      await audio.play();
    } else {
      const audio = habit?.completed
        ? new Audio(toggleOffSound)
        : new Audio(toggleOnSound);
      await audio.play();
    }
  };

  return (
    <Card
      className={`min-w-[400px] ${
        isDarkMode ? "border-gray-700 bg-gray-800" : "border-purple-200"
      }
      `}
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
          isEditMode={isEditMode}
          habits={habits}
          toggleHabit={toggleHabit}
          animatingHabitId={animatingHabitId}
          toggleIsEditingHabit={toggleIsEditingHabit}
          setEditingHabit={setEditingHabit}
        />
      </CardContent>
    </Card>
  );
}
