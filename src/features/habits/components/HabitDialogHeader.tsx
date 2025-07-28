import { memo } from 'react';
import AddHabitDialogHeaderTitle from '@/features/habits/components/AddHabitDialogHeaderTitle';
import EditHabitDialogHeaderTitle from '@/features/habits/components/EditHabitDialogHeaderTitle';
import { Habit } from '@/features/habits/types/Habit';

interface HabitDialogHeaderProps {
  isEditMode: boolean;
  habit?: Habit | null;
}

const HabitDialogHeader = memo(function HabitDialogHeader({
  isEditMode,
  habit,
}: HabitDialogHeaderProps) {
  if (isEditMode) {
    return <EditHabitDialogHeaderTitle habit={habit} />;
  }

  return <AddHabitDialogHeaderTitle />;
});

export default HabitDialogHeader;
