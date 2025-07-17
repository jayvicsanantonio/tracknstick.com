import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function AddHabitDialogHeaderTitle() {
  return (
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)]">
        Add New Habit
      </DialogTitle>
      <DialogDescription className="sr-only">
        Add a new habit to your list.
      </DialogDescription>
    </DialogHeader>
  );
}
