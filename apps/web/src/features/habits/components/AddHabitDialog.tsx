import { lazy, Suspense } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog';
import HabitDialog from '@/features/habits/components/HabitDialog';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

// The form, and the date picker it carries, download the first time a habit
// dialog opens: the dialog renders its content only while open.
const HabitForm = lazy(() => import('@/features/habits/components/HabitForm'));

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
      <Suspense fallback={null}>
        <HabitForm toggleDialog={toggleShowAddHabitDialog} />
      </Suspense>
    </HabitDialog>
  );
}
