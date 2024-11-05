import { Habit } from "@/types/habit";

export interface DailyHabitListProps {
  isEditMode: boolean;
  habits: Habit[];
  toggleHabit: (id: string) => Promise<void>;
  animatingHabitId: string | null;
  toggleIsEditingHabit: () => void;
  setEditingHabit: (habit: Habit | null) => void;
}
