// Asks to confirm a habit's deletion: an iOS action sheet on phones, a centred dialog on wider screens.
// Shown while a habit is given; Delete confirms, Cancel or Escape keeps the habit.

import { memo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import { useIsPhone } from '@shared/hooks/useIsPhone';
import { Habit } from '@/features/habits/types/Habit';

interface DeleteHabitConfirmationProps {
  /** The habit to confirm deleting; nothing shows without one. */
  habit: Habit | undefined;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteHabitConfirmation = memo(function DeleteHabitConfirmation({
  habit,
  onConfirm,
  onCancel,
}: DeleteHabitConfirmationProps) {
  const isPhone = useIsPhone();
  const question = `Are you sure you want to delete “${habit?.name}”? This action cannot be undone.`;

  return (
    <AlertDialog
      open={habit !== undefined}
      onOpenChange={(open) => !open && onCancel()}
    >
      {isPhone ? (
        // An action sheet: the question and the red Delete in one rounded
        // group above the bottom edge, and Cancel apart beneath it.
        <AlertDialogContent className="top-auto right-2 bottom-[max(env(safe-area-inset-bottom),0.5rem)] left-2 w-auto max-w-none translate-x-0 translate-y-0 gap-2 border-0 bg-transparent p-0 shadow-none data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-bottom-full data-[state=open]:zoom-in-100">
          <div className="overflow-hidden rounded-2xl bg-(--color-card)">
            <AlertDialogHeader className="gap-1 px-4 py-3.5 text-center">
              <AlertDialogTitle className="text-sm font-semibold text-(--color-text-secondary)">
                Delete Habit
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-(--color-text-secondary)">
                {question}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction
              onClick={onConfirm}
              className="h-14 w-full rounded-none border-t border-(--color-border-primary) bg-transparent text-lg font-normal text-(--color-destructive) shadow-none hover:bg-(--color-hover-surface)"
            >
              Delete
            </AlertDialogAction>
          </div>
          <AlertDialogCancel className="h-14 w-full rounded-2xl border-0 bg-(--color-card) text-lg font-semibold text-(--color-brand-text) shadow-none hover:bg-(--color-hover-surface) dark:text-(--color-brand-primary)">
            Cancel
          </AlertDialogCancel>
        </AlertDialogContent>
      ) : (
        <AlertDialogContent className="bg-(--color-card) text-(--color-card-foreground)">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-(--color-foreground)">
              Delete Habit
            </AlertDialogTitle>
            <AlertDialogDescription className="text-(--color-text-secondary)">
              {question}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-(--color-muted) text-(--color-foreground) hover:bg-(--color-hover-surface)">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className="bg-(--color-destructive) text-(--color-destructive-foreground) hover:opacity-90 focus:ring-(--color-ring)"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
});

export default DeleteHabitConfirmation;
