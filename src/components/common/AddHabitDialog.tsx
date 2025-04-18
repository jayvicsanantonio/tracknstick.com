import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";
import { Habit } from "@/features/habits/types";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useHabitsState } from "@/features/habits/context/HabitsStateContext";

export default function AddHabitDialog() {
  const { showAddHabitDialog, toggleShowAddHabitDialog } = useHabitsState();
  const { addHabit } = useHabits();

  const handleFormSubmit = async (
    habitDataFromForm: Habit,
    willDelete: boolean,
  ): Promise<void> => {
    if (!willDelete) {
      const { name, icon, frequency } = habitDataFromForm;
      await addHabit({ name, icon, frequency });
    }
  };

  return (
    <HabitDialog
      isOpen={showAddHabitDialog}
      toggleIsOpen={toggleShowAddHabitDialog}
    >
      <HabitDialogHeader isEditMode={false} />
      <HabitForm
        handleSubmit={handleFormSubmit}
        toggleDialog={toggleShowAddHabitDialog}
      />
    </HabitDialog>
  );
}
