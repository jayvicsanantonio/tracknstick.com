export type Frequency = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

import HabitsIcons from "@/icons/habits";

export interface Habit {
  id?: string;
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
