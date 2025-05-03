import HabitDialog from "@/features/habits/components/HabitDialog";
import HabitDialogHeader from "@/features/habits/components/HabitDialogHeader";
import HabitForm from "@/features/habits/components/HabitForm";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";

export default function AddHabitDialog() {
  const { showAddHabitDialog, toggleShowAddHabitDialog } = useHabitsContext();

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
