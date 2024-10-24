import { Habit } from "@/types/habit";

export interface DailyHabitListProps {
  isDarkMode: boolean;
  isEditMode: boolean;
  habits: Habit[];
  toggleHabit: (id: string) => Promise<void>;
  animatingHabitId: string | null;
  toggleIsEditingHabit: () => void;
  setEditingHabit: (habit: Habit | null) => void;
}
