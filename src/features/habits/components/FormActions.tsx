import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Habit } from "@/features/habits/types/Habit";

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
            className="w-full border-[var(--color-error)] bg-[var(--color-surface)] text-sm text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-[var(--color-text-inverse)] sm:w-auto sm:text-base dark:bg-transparent dark:hover:border-[var(--color-error)] dark:hover:bg-[var(--color-error)]"
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
            className="border-[var(--color-border-brand)] text-sm text-[var(--color-brand-primary)] hover:bg-[var(--color-hover-brand)] hover:text-[var(--color-brand-secondary)] sm:text-base dark:border-[var(--color-border-brand)] dark:bg-[var(--color-brand-light)] dark:text-[var(--color-brand-text-light)] dark:hover:border-[var(--color-border-brand)] dark:hover:bg-[var(--color-hover-brand)] dark:hover:text-[var(--color-brand-text-light)]"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="flex-1 bg-[var(--color-brand-primary)] text-sm text-[var(--color-text-inverse)] hover:bg-[var(--color-brand-secondary)] sm:w-32 sm:flex-none sm:text-base dark:hover:bg-[var(--color-brand-primary)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
