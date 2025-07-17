import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import frequencyLabel from '@/lib/frequencyLabel';
import HabitsIcons from '@/icons/habits';
import { Habit } from '@/features/habits/types/Habit';

export default function EditHabitDialogHeaderTitle({
  habit,
}: {
  habit?: Habit | null;
}) {
  if (!habit) {
    return null;
  }
  const HabitIcon = habit && HabitsIcons[habit.icon];

  return (
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)]">
        {HabitIcon && <HabitIcon className="mr-2 inline-block h-8 w-8" />}
        {habit.name}
      </DialogTitle>
      <DialogDescription>{frequencyLabel(habit.frequency)}</DialogDescription>
    </DialogHeader>
  );
}
