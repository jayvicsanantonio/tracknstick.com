import { useContext } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThemeContext } from "@/context/ThemeContext";
import VisuallyHidden from "@/components/ui/accessibility/VisuallyHidden";

export default function AddHabitDialogHeaderTitle() {
  const { isDarkMode } = useContext(ThemeContext);

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
