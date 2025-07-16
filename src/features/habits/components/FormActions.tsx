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
    <div className="flex flex-col-reverse sm:flex-row items-center gap-2 mt-2 sm:mt-0">
      <div className="w-full sm:w-auto sm:flex-1 mt-2 sm:mt-0">
        {habit?.id && onDelete && (
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-[var(--color-text-inverse)] text-sm sm:text-base bg-[var(--color-surface)] hover:bg-[var(--color-error)] dark:bg-transparent dark:hover:bg-[var(--color-error)] dark:hover:border-[var(--color-error)]"
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
      <div className="flex flex-row gap-2 w-full sm:w-auto">
        <DialogClose asChild className={`flex-1 sm:flex-none`}>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="text-sm sm:text-base border-[var(--color-border-brand)] text-[var(--color-brand-primary)] hover:bg-[var(--color-hover-brand)] hover:text-[var(--color-brand-secondary)] dark:border-[var(--color-border-brand)] dark:bg-[var(--color-brand-light)] dark:text-[var(--color-brand-text-light)] dark:hover:bg-[var(--color-hover-brand)] dark:hover:text-[var(--color-brand-text-light)] dark:hover:border-[var(--color-border-brand)]"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="flex-1 sm:flex-none sm:w-32 text-sm sm:text-base bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] text-[var(--color-text-inverse)] dark:hover:bg-[var(--color-brand-primary)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
