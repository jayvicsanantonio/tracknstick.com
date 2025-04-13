import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSWRConfig } from 'swr';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarX2, PlusCircle } from 'lucide-react';
import { Habit } from '@/types/habit';
import DailyHabitDate from '@/components/common/DailyHabitDate';
import DailyHabitProgressIndicator from '@/components/common/DailyHabitProgressIndicator';
import DailyHabitList from '@/components/common/DailyHabitList';
import { ThemeContext } from '@/context/ThemeContext';
import { DateContext } from '@/context/DateContext';
import toggleOnSound from '@/assets/audio/habit-toggled-on.mp3';
import toggleOffSound from '@/assets/audio/habit-toggled-off.mp3';
import completedAllHabits from '@/assets/audio/completed-all-habits.mp3';
import { apiClient } from '@/services/api';

export default function DailyHabitTracker({
  isEditMode,
  habits,
  toggleIsEditingHabit,
  setEditingHabit,
  onAddHabitClick,
}: {
  isEditMode: boolean;
  habits: Habit[];
  toggleIsEditingHabit: () => void;
  setEditingHabit: (habit: Habit | null) => void;
  onAddHabitClick: () => void;
}) {
  const { mutate } = useSWRConfig();
  const { isDarkMode } = useContext(ThemeContext);
  const { date, timeZone } = useContext(DateContext);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [animatingHabitId, setAnimatingHabitId] = useState<
    string | null
  >(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const completionRate = useMemo(() => {
    const completedHabits = habits.filter(
      (habit) => habit.completed
    ).length;
    return Math.round((completedHabits / habits.length) * 100);
  }, [habits]);

  const addTracker = useCallback(
    async (id: string): Promise<void> => {
      const dateString = date.toISOString();

      try {
        await apiClient.post<{
          message: string;
          trackerId: string;
        }>(`/api/v1/habits/${id}/trackers`, {
          timeZone,
          timestamp: dateString,
        });
      } catch (error) {
        console.error('Error adding tracker:', error);
        throw error;
      } finally {
        await mutate(
          `/api/v1/habits?date=${dateString}&timeZone=${timeZone}`,
          habits.map((habit) => {
            if (habit.id === id) {
              const newCompleted = !habit.completed;

              if (newCompleted) {
                if (timeoutId) {
                  clearTimeout(timeoutId);
                }

                setAnimatingHabitId(id);

                const newTimeoutId = setTimeout(
                  () => setAnimatingHabitId(null),
                  1000
                );

                setTimeoutId(newTimeoutId);
              }
              return { ...habit, completed: newCompleted };
            }
            return habit;
          })
        );
      }
    },
    [habits, date, timeZone, timeoutId, mutate]
  );

  const toggleHabit = async (id: string) => {
    await addTracker(id);
    const habit = habits.find((habit) => habit.id === id);
    const allHabitsCompleted =
      habits.filter((habit) => habit.completed).length ===
        habits.length - 1 && !habit?.completed;

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
    <div className="flex-1">
      <Card
        className={`min-w-[400px] ${
          isDarkMode
            ? 'border-gray-700 bg-gray-800'
            : 'border-purple-200'
        }
      `}
      >
        <CardHeader>
          <DailyHabitDate />
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div
              className={`${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-100 '
              } flex flex-col items-center justify-center gap-4 py-8 px-20 text-center rounded-lg`}
            >
              <CalendarX2
                className={`${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                } h-12 w-12`}
              />
              <h3
                className={`${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                } text-lg font-semibold`}
              >
                No Habits Found
              </h3>
              <p
                className={`${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                } mt-2`}
              >
                Try adding a new habit to start tracking your daily
                progress, or check a different date to view existing
                habits. Building good habits is the first step towards
                achieving your goals!
              </p>
              <Button
                onClick={onAddHabitClick}
                className={`${
                  isDarkMode
                    ? 'bg-purple-700 hover:bg-purple-600'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white rounded-full font-semibold transition-colors duration-300 shadow-lg mt-4`}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Habit
              </Button>
            </div>
          ) : (
            <>
              <DailyHabitProgressIndicator
                completionRate={completionRate}
              />
              <DailyHabitList
                isEditMode={isEditMode}
                habits={habits}
                toggleHabit={toggleHabit}
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
