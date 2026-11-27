// Footer buttons of the habit form: Delete when editing, Cancel, and submit.
// The submit label says what happens: "Add habit" for a new habit, "Save Changes" for an edit.

import { memo, useCallback } from 'react';
import { DialogClose } from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Habit } from '@/features/habits/types/Habit';

interface FormActionsProps {
  isSubmitting: boolean;
  onDelete?: (habitId: string) => void | Promise<void>;
  habit?: Habit | null;
}

const FormActions = memo(function FormActions({
  isSubmitting,
  onDelete,
  habit,
}: FormActionsProps) {
  const isEditing = Boolean(habit?.id);
  const submittingLabel = isEditing ? 'Saving...' : 'Adding…';
  const submitLabel = isEditing ? 'Save Changes' : 'Add habit';

  const handleDelete = useCallback(() => {
    if (!habit?.id || !onDelete) return;
    void onDelete(habit.id);
  }, [habit?.id, onDelete]);
  return (
    <div className="flex shrink-0 flex-row items-center gap-2 max-sm:-mx-4 max-sm:border-t max-sm:border-(--color-border-brand) max-sm:bg-(--color-brand-lighter) max-sm:px-4 max-sm:pt-3 max-sm:pb-[max(env(safe-area-inset-bottom),1rem)] dark:max-sm:border-(--color-border-secondary) dark:max-sm:bg-(--color-surface-secondary)">
      <div className="max-sm:empty:hidden sm:flex-1">
        {habit?.id && onDelete && (
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-(--color-destructive)/40 bg-transparent px-4 text-sm font-semibold text-(--color-destructive) transition-[background-color,color,transform] hover:border-(--color-destructive) hover:bg-(--color-destructive) hover:text-(--color-destructive-foreground) active:scale-[0.98]"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Delete
          </Button>
        )}
      </div>
      <div className="flex flex-1 flex-row gap-2 sm:w-auto sm:flex-none">
        <DialogClose asChild className="flex-1 sm:flex-none">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-10 rounded-full border-(--color-border-primary)/80 bg-(--color-brand-primary)/8 px-5 text-sm font-semibold text-(--color-brand-text) transition-[background-color,transform] hover:bg-(--color-brand-primary)/15 active:scale-[0.98] dark:text-(--color-brand-text-light)"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="h-10 flex-1 rounded-full bg-(--color-brand-solid) px-5 text-sm font-semibold text-(--color-primary-foreground) shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.12)] transition-[background-color,transform] hover:bg-(--color-brand-secondary) active:scale-[0.98] sm:min-w-[132px] sm:flex-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
});

export default FormActions;
