import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import VisuallyHidden from "@/components/common/VisuallyHidden";

export default function AddHabitDialogHeaderTitle({
  isDarkMode,
}: {
  isDarkMode: boolean;
}) {
  return (
    <DialogHeader>
      <DialogTitle
        className={`text-2xl font-bold ${
          isDarkMode ? "text-purple-200" : "text-purple-800"
        }`}
      >
        Add New Habit
      </DialogTitle>
      <VisuallyHidden>
        <DialogDescription>Add a new habit to your list.</DialogDescription>
      </VisuallyHidden>
    </DialogHeader>
  );
}
