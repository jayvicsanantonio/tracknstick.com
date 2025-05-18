import { useContext } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/context/ThemeContext";
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
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center gap-2 mt-2 sm:mt-0">
      <div className="w-full sm:w-auto sm:flex-1 mt-2 sm:mt-0">
        {habit?.id && onDelete && (
          <Button
            type="button"
            variant="outline"
            className={`w-full sm:w-auto  border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-sm sm:text-base ${
              isDarkMode
                ? "hover:bg-red-600 bg-transparent hover:border-red-600"
                : "hover:bg-red-400 bg-white"
            }`}
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
            className={`text-sm sm:text-base ${
              isDarkMode
                ? "border-purple-500 bg-gray-800 text-white hover:bg-gray-700 hover:text-purple-300 hover:border-purple-400"
                : "border-purple-300 hover:bg-purple-100 hover:text-purple-700"
            }`}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className={`flex-1 sm:flex-none sm:w-32 text-sm sm:text-base ${
            isDarkMode
              ? "bg-purple-700 hover:bg-purple-600 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
