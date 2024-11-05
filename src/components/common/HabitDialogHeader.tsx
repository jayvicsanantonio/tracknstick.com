import AddHabitDialogHeaderTitle from "@/components/common/AddHabitDialogHeaderTitle";
import EditHabitDialogHeaderTitle from "@/components/common/EditHabitDialogHeaderTitle";
import { Habit } from "@/types/habit";

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
