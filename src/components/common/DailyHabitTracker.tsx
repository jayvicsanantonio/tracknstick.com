import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSWRConfig } from 'swr';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Habit } from '@/types/habit';
import NoHabits from '@/components/common/NoHabits';
import DailyHabitDate from '@/components/common/DailyHabitDate';
import DailyHabitProgressIndicator from '@/components/common/DailyHabitProgressIndicator';
import DailyHabitList from '@/components/common/DailyHabitList';
import { AppContext } from '@/context/AppContext';
import { apiClient } from '@/services/api';

// Preload audio files
const audioFiles = {
  toggleOn: new Audio('/src/assets/audio/habit-toggled-on.mp3'),
  toggleOff: new Audio('/src/assets/audio/habit-toggled-off.mp3'),
  complete: new Audio('/src/assets/audio/completed-all-habits.mp3'),
};

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
  const { isDarkMode, date, timeZone } = useContext(AppContext);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const completionRate = useMemo(() => {
    if (!habits.length) return 0;
    const completedHabits = habits.filter((habit) => habit.completed).length;
    return Math.round((completedHabits / habits.length) * 100);
  }, [habits]);

  const addTracker = useCallback(
    async (id: string): Promise<void> => {
      const dateString = date.toISOString();
      const habit = habits.find((h) => h.id === id);
      const wasCompleted = habit?.completed;

      try {
        await apiClient.post<{ message: string; trackerId: string }>(
          `/api/v1/habits/${id}/trackers`,
          {
            timeZone,
            timestamp: dateString,
          }
        );

        // Optimistic update
        await mutate(
          `/api/v1/habits?date=${dateString}&timeZone=${timeZone}`,
          habits.map((h) => {
            if (h.id === id) {
              const newCompleted = !h.completed;
              return { ...h, completed: newCompleted };
            }
            return h;
          }),
          false
        );

        if (!wasCompleted) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          setAnimatingHabitId(id);
          timeoutRef.current = setTimeout(() => setAnimatingHabitId(null), 1000);
        }

      } catch (error) {
        console.error('Error adding tracker:', error);
        // Revert optimistic update on error
        await mutate(
          `/api/v1/habits?date=${dateString}&timeZone=${timeZone}`
        );
        throw error;
      }
    },
    [habits, date, timeZone, mutate]
  );

  const toggleHabit = useCallback(async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    const willComplete = !habit?.completed;
    const willCompleteAll = 
      willComplete && 
      habits.filter((h) => h.completed).length === habits.length - 1;

    await addTracker(id);

    // Play appropriate sound
    const audio = willCompleteAll
      ? audioFiles.complete
      : willComplete
      ? audioFiles.toggleOn
      : audioFiles.toggleOff;

    try {
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [habits, addTracker]);

  return (
    <div className="flex-1">
      <Card
        className={`min-w-[400px] ${
          isDarkMode
            ? 'border-gray-700 bg-gray-800'
            : 'border-purple-200'
        }`}
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
