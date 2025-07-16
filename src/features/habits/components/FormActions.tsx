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
            className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-sm sm:text-base bg-white hover:bg-red-400 dark:bg-transparent dark:hover:bg-red-600 dark:hover:border-red-600"
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
            className="text-sm sm:text-base border-purple-300 hover:bg-purple-100 hover:text-purple-700 dark:border-purple-600 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-800/60 dark:hover:text-purple-300 dark:hover:border-purple-500"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="flex-1 sm:flex-none sm:w-32 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white dark:hover:bg-purple-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
