import { useCallback, useContext } from "react";
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast";
import { DateContext } from "@/context/DateContext";
import { Habit } from "@/features/habits/types";
import {
  fetchHabits,
  addHabit as apiAddHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleHabitCompletion,
} from "@/features/habits/api";

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: unknown;
  mutateHabits: () => Promise<Habit[] | undefined>;
  addHabit: (
    habitData: Omit<Habit, "id" | "completed" | "stats">,
  ) => Promise<void>;
  updateHabit: (
    habitId: string,
    habitData: Partial<Omit<Habit, "id" | "completed" | "stats">>,
  ) => Promise<void>;
  deleteHabit: (habitId: string, habitName: string) => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
}
export function useHabits(): UseHabitsReturn {
  const { toast } = useToast();
  const { date, timeZone } = useContext(DateContext);

  const habitsEndpointKey = date
    ? `/api/v1/habits?date=${date.toISOString()}&timeZone=${timeZone}`
    : null;

  const {
    data: fetchedHabits,
    error,
    isLoading,
    mutate: mutateHabits,
  } = useSWR<Habit[], unknown>(
    habitsEndpointKey,
    () => (date ? fetchHabits(date, timeZone) : Promise.resolve([])),
    {},
  );

  const addHabit = useCallback(
    async (habitData: Omit<Habit, "id" | "completed" | "stats">) => {
      try {
        await apiAddHabit(habitData);
        toast({
          description: `Habit "${habitData.name}" added successfully.`,
        });
        void mutateHabits();
      } catch (err) {
        console.error("Failed to add habit:", err);
        toast({
          variant: "destructive",
          description: `Failed to add habit "${habitData.name}". Please try again.`,
        });
      }
    },
    [mutateHabits, toast],
  );

  const habits = fetchedHabits ?? [];

  const updateHabit = useCallback(
    async (
      habitId: string,
      habitData: Partial<Omit<Habit, "id" | "completed" | "stats">>,
    ) => {
      void mutateHabits(
        (currentHabits) =>
          currentHabits?.map((h) =>
            h.id === habitId ? { ...h, ...habitData } : h,
          ),
        false,
      );

      try {
        await apiUpdateHabit(habitId, habitData);
        toast({
          description: `Habit "${habitData.name ?? "habit"}" updated.`,
        });
      } catch (err) {
        console.error("Failed to update habit:", err);
        toast({
          variant: "destructive",
          description: `Failed to update habit "${
            habitData.name ?? "habit"
          }". Reverting changes.`,
        });
      } finally {
        void mutateHabits();
      }
    },
    [mutateHabits, toast],
  );

  const deleteHabit = useCallback(
    async (habitId: string, habitName: string) => {
      void mutateHabits(
        (currentHabits) => currentHabits?.filter((h) => h.id !== habitId),
        false,
      );

      try {
        await apiDeleteHabit(habitId);
        toast({ description: `Habit "${habitName}" deleted.` });
      } catch (err) {
        console.error("Failed to delete habit:", err);
        toast({
          variant: "destructive",
          description: `Failed to delete habit "${habitName}". Restoring habit.`,
        });
      } finally {
        void mutateHabits();
      }
    },
    [mutateHabits, toast],
  );

  const toggleHabit = useCallback(
    async (habitId: string) => {
      void mutateHabits(
        (currentHabits = []) =>
          currentHabits.map((h) =>
            h.id === habitId ? { ...h, completed: !h.completed } : h,
          ),
        false,
      );

      try {
        if (!date) throw new Error("Date context is not available");
        await apiToggleHabitCompletion(habitId, date, timeZone);
      } catch (err) {
        console.error("Failed to toggle habit completion:", err);
        toast({
          variant: "destructive",
          description: "Failed to update habit status. Reverting change.",
        });
      } finally {
        void mutateHabits();
      }
    },
    [date, timeZone, mutateHabits, toast],
  );

  return {
    habits,
    isLoading,
    error,
    mutateHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
  };
}
