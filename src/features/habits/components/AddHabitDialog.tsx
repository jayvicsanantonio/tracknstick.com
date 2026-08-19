import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog';
import HabitDialog from '@/features/habits/components/HabitDialog';
import HabitForm from '@/features/habits/components/HabitForm';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

export default function AddHabitDialog() {
  const { showAddHabitDialog, toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <HabitDialog
      isOpen={showAddHabitDialog}
      toggleIsOpen={toggleShowAddHabitDialog}
    >
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-(--color-brand-tertiary) dark:text-(--color-brand-text-light)">
          Add New Habit
        </DialogTitle>
        <DialogDescription className="sr-only">
          Add a new habit to your list.
        </DialogDescription>
      </DialogHeader>
      <HabitForm toggleDialog={toggleShowAddHabitDialog} />
    </HabitDialog>
  );
}
