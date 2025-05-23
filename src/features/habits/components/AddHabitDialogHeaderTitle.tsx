import { useContext } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThemeContext } from "@/context/ThemeContext";

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
      <DialogDescription className="sr-only">
        Add a new habit to your list.
      </DialogDescription>
    </DialogHeader>
  );
}
