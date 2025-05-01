import AddHabitDialogHeaderTitle from "@/features/habits/components/dialog/AddHabitDialogHeaderTitle";
import EditHabitDialogHeaderTitle from "@/features/habits/components/dialog/EditHabitDialogHeaderTitle";
import { Habit } from "@/features/habits/types";

export default function HabitDialogHeader({
  isEditMode,
  habit,
}: {
  isEditMode: boolean;
  habit?: Habit | null;
}) {
  if (isEditMode) {
    return <EditHabitDialogHeaderTitle habit={habit} />;
  }

  return <AddHabitDialogHeaderTitle />;
}
