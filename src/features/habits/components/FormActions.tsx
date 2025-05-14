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
    <div className="flex items-center flex-row gap-2">
      <div className="flex-1">
        {habit?.id && onDelete && (
          <Button
            type="button"
            variant="outline"
            className={`border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${
              isDarkMode ? "hover:bg-red-600" : "hover:bg-red-400"
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
      <div className="flex flex-row gap-2">
        <DialogClose
          asChild
          className={
            isDarkMode
              ? "border-gray-600 hover:bg-gray-700 hover:text-white"
              : "border-purple-300 hover:bg-purple-100"
          }
        >
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className={`w-32 ${
            isDarkMode
              ? "bg-purple-700 hover:bg-purple-600"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
