import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";

export default function AddHabitDialog({
  isDarkMode,
  showAddHabitDialog,
  toggleShowAddHabitDialog,
}: {
  isDarkMode: boolean;
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
}) {
  return (
    <HabitDialog
      isDarkMode={isDarkMode}
      isOpen={showAddHabitDialog}
      toggleIsOpen={toggleShowAddHabitDialog}
    >
      <HabitDialogHeader isDarkMode={isDarkMode} />
      <HabitForm
        isDarkMode={isDarkMode}
        toggleShowAddHabitDialog={toggleShowAddHabitDialog}
      />
    </HabitDialog>
  );
}
