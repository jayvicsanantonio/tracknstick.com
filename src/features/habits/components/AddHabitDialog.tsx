import HabitDialog from "./HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";
import { useHabitsState } from "@/features/habits/context/HabitsStateContext";

export default function AddHabitDialog() {
  const { showAddHabitDialog, toggleShowAddHabitDialog } = useHabitsState();

  return (
    <HabitDialog
      isOpen={showAddHabitDialog}
      toggleIsOpen={toggleShowAddHabitDialog}
    >
      <HabitDialogHeader isEditMode={false} />
      <HabitForm toggleDialog={toggleShowAddHabitDialog} />
    </HabitDialog>
  );
}
