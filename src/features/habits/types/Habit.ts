import { Frequency } from '@/features/habits/types/Frequency';
import HabitsIcons from '@/icons/habits';

/**
 * A habit as the API returns it and as the SWR cache holds it.
 *
 * Dates are strings here because that is what arrives over the wire; axios
 * performs no revival. Declaring them as Date made three call sites re-wrap
 * with `new Date(...)` a value the type already claimed was a Date.
 */
export interface Habit {
  id: string;
  name: string;
  icon: keyof typeof HabitsIcons;
  frequency: Frequency[];
  completed: boolean;
  startDate: string;
  endDate?: string;
}

/**
 * A habit as the client sends it.
 *
 * Separate from Habit because the two genuinely differ: there is no id yet,
 * and the form works in Date objects.
 */
export interface HabitPayload {
  name: string;
  icon: keyof typeof HabitsIcons;
  frequency: Frequency[];
  startDate: Date;
  endDate?: Date;
}
