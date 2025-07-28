import { memo } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import HabitsIcons from '@/icons/habits';
import { Habit } from '@/features/habits/types/Habit';

interface EditHabitDialogHeaderTitleProps {
  habit?: Habit | null;
}

const EditHabitDialogHeaderTitle = memo(function EditHabitDialogHeaderTitle({
  habit,
}: EditHabitDialogHeaderTitleProps) {
  if (!habit) {
    return null;
  }
  const HabitIcon = habit && HabitsIcons[habit.icon];

  return (
    <DialogHeader>
      <DialogTitle className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-2xl font-bold">
        {HabitIcon && <HabitIcon className="mr-2 inline-block h-8 w-8" />}
        {habit.name}
      </DialogTitle>
      <DialogDescription>{frequencyLabel(habit.frequency)}</DialogDescription>
    </DialogHeader>
  );
});

export default EditHabitDialogHeaderTitle;
