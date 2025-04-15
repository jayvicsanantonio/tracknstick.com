import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSWRConfig } from 'swr';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Habit } from '@/types/habit';
import NoHabits from '@/components/common/NoHabits';
import DailyHabitDate from '@/components/common/DailyHabitDate';
import DailyHabitProgressIndicator from '@/components/common/DailyHabitProgressIndicator';
import DailyHabitList from '@/components/common/DailyHabitList';
import { ThemeContext } from '@/context/ThemeContext';
import { DateContext } from '@/context/DateContext';
import toggleOnSound from '@/assets/audio/habit-toggled-on.mp3';
import toggleOffSound from '@/assets/audio/habit-toggled-off.mp3';
import completedAllHabits from '@/assets/audio/completed-all-habits.mp3';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import getConfig from '@/lib/getConfig';
const { apiHost } = getConfig();

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
  const { getToken } = useAuth();
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
        const token = await getToken();
        await axios.post<{
          message: string;
          trackerId: string;
        }>(
          `${apiHost}/api/v1/habits/${id}/trackers`,
          {
            timeZone,
            timestamp: dateString,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
    [habits, date, timeZone, timeoutId, mutate, getToken]
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
            <NoHabits onAddHabitClick={onAddHabitClick} />
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
