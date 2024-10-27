import AddHabitDialogHeaderTitle from "@/components/common/AddHabitDialogHeaderTitle";
import EditHabitDialogHeaderTitle from "@/components/common/EditHabitDialogHeaderTitle";
import { Habit } from "@/types/habit";

export default function HabitDialogHeader({
  isDarkMode,
  isEditMode,
  habit,
}: {
  isDarkMode: boolean;
  isEditMode: boolean;
  habit?: Habit | null;
}) {
  if (isEditMode) {
    return <EditHabitDialogHeaderTitle isDarkMode={isDarkMode} habit={habit} />;
  }

  return <AddHabitDialogHeaderTitle isDarkMode={isDarkMode} />;
}
