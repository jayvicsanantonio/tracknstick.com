import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";

export default function AddHabitDialog({
  showAddHabitDialog,
  toggleShowAddHabitDialog,
}: {
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
}) {
  return (
    <HabitDialog
      isOpen={showAddHabitDialog}
      toggleIsOpen={toggleShowAddHabitDialog}
    >
      <HabitDialogHeader isEditMode={false} />
      <HabitForm toggleShowHabitDialog={toggleShowAddHabitDialog} />
    </HabitDialog>
  );
}
