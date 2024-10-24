import HabitsIcons from "@/icons/habits";
import { Frequency } from "@/types/frequency";

export interface Habit {
  id: string;
  name: string;
  icon: keyof typeof HabitsIcons;
  frequency: Frequency[];
  completed: boolean;
  stats: {
    streak: number;
    totalCompletions: number;
    lastCompleted: string | null;
  };
}
