import { useContext } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import frequencyLabel from "@/lib/frequencyLabel";
import HabitsIcons from "@/icons/habits";
import { ThemeContext } from "@/context/ThemeContext";
import { Habit } from "@/types/habit";

export default function EditHabitDialogHeaderTitle({
  habit,
}: {
  habit?: Habit | null;
}) {
  const { isDarkMode } = useContext(ThemeContext);

  if (!habit) {
    return null;
  }
  const HabitIcon = habit && HabitsIcons[habit.icon];

  return (
    <DialogHeader>
      <DialogTitle
        className={`text-2xl font-bold ${
          isDarkMode ? "text-purple-200" : "text-purple-800"
        }`}
      >
        {HabitIcon && <HabitIcon className="inline-block mr-2 h-8 w-8" />}
        {habit.name}
      </DialogTitle>
      <DialogDescription>{frequencyLabel(habit.frequency)}</DialogDescription>
    </DialogHeader>
  );
}
