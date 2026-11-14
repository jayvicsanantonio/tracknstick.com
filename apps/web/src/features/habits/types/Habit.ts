// A habit as the web app holds it, and a habit as the form sends it.
// The API's habit shape comes from the contracts package; only `icon` is narrowed here.

import type { Frequency, HabitResponse } from '@tracknstick/contracts';
import HabitsIcons from '@/icons/habits';

/**
 * A habit as the API returns it and as the SWR cache holds it.
 *
 * Dates are strings here because that is what arrives over the wire; axios
 * performs no revival. Declaring them as Date made three call sites re-wrap
 * with `new Date(...)` a value the type already claimed was a Date.
 *
 * `icon` is a known HabitsIcons key, which the API does not promise;
 * fetchHabits makes it one.
 */
export type Habit = Omit<HabitResponse, 'icon'> & {
  icon: keyof typeof HabitsIcons;
};

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
