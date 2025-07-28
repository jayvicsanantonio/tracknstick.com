import { DialogClose } from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Habit } from '@/features/habits/types/Habit';

interface FormActionsProps {
  isSubmitting: boolean;
  onDelete?: (habitId: string) => void;
  habit?: Habit | null;
}

export default function FormActions({
  isSubmitting,
  onDelete,
  habit,
}: FormActionsProps) {
  return (
    <div className="mt-2 flex flex-col-reverse items-center gap-2 sm:mt-0 sm:flex-row">
      <div className="mt-2 w-full sm:mt-0 sm:w-auto sm:flex-1">
        {habit?.id && onDelete && (
          <Button
            type="button"
            variant="outline"
            className="border-(--color-error) bg-(--color-surface) text-(--color-error) hover:bg-(--color-error) hover:text-(--color-text-inverse) dark:hover:border-(--color-error) dark:hover:bg-(--color-error) w-full text-sm sm:w-auto sm:text-base dark:bg-transparent"
            onClick={() => {
              if (!habit?.id) return;
              void onDelete(habit.id);
            }}
            disabled={isSubmitting}
          >
            Delete
          </Button>
        )}
      </div>
      <div className="flex w-full flex-row gap-2 sm:w-auto">
        <DialogClose asChild className={`flex-1 sm:flex-none`}>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="border-(--color-border-brand) text-(--color-brand-primary) hover:bg-(--color-hover-brand) hover:text-(--color-brand-secondary) dark:border-(--color-border-brand) dark:bg-(--color-brand-light) dark:text-(--color-brand-text-light) dark:hover:border-(--color-border-brand) dark:hover:bg-(--color-hover-brand) dark:hover:text-(--color-brand-text-light) text-sm sm:text-base"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="bg-(--color-brand-primary) text-(--color-text-inverse) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-primary) dark:hover:bg-(--color-brand-primary)/90 flex-1 text-sm sm:w-32 sm:flex-none sm:text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
