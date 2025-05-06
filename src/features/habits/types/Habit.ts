import { Frequency } from "@/features/habits/types/Frequency";
import HabitsIcons from "@/icons/habits";

export interface Habit {
  id?: string;
  name: string;
  icon: keyof typeof HabitsIcons;
  frequency: Frequency[];
  completed: boolean;
  stats: {
    streak: number;
    total_completions: number;
    last_completed: string | null;
  };
}
