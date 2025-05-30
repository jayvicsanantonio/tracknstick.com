import { Frequency } from '@/features/habits/types/Frequency';
import HabitsIcons from '@/icons/habits';

export interface Habit {
  id?: string;
  name: string;
  icon: keyof typeof HabitsIcons;
  frequency: Frequency[];
  completed: boolean;
  startDate: Date;
  endDate?: Date;
}
