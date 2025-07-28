import { memo } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog';

const AddHabitDialogHeaderTitle = memo(function AddHabitDialogHeaderTitle() {
  return (
    <DialogHeader>
      <DialogTitle className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-2xl font-bold">
        Add New Habit
      </DialogTitle>
      <DialogDescription className="sr-only">
        Add a new habit to your list.
      </DialogDescription>
    </DialogHeader>
  );
});

export default AddHabitDialogHeaderTitle;
