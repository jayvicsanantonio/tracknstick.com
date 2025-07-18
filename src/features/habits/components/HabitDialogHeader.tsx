import AddHabitDialogHeaderTitle from '@/features/habits/components/AddHabitDialogHeaderTitle';
import EditHabitDialogHeaderTitle from '@/features/habits/components/EditHabitDialogHeaderTitle';
import { Habit } from '@/features/habits/types/Habit';

export default function HabitDialogHeader({
  isEditMode,
  habit,
}: {
  isEditMode: boolean;
  habit?: Habit | null;
}) {
  if (isEditMode) {
    return <EditHabitDialogHeaderTitle habit={habit} />;
  }

  return <AddHabitDialogHeaderTitle />;
}
