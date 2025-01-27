import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";
import { Habit } from "@/types/habit";
import { apiClient } from "@/services/api";

export default function AddHabitDialog({
  setHabit,
  showAddHabitDialog,
  toggleShowAddHabitDialog,
}: {
  setHabit: (habit: Habit) => void;
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
}) {
  async function handleSubmit(habit: Habit): Promise<void> {
    try {
      const response = await apiClient.post<{
        message: string;
        habitId: string;
      }>("/habits", habit);
      const { habitId } = response.data;
      const newHabit = { ...habit, id: habitId };

      setHabit(newHabit);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }

    toggleShowAddHabitDialog();
  }

  return (
    <HabitDialog
      isOpen={showAddHabitDialog}
      toggleIsOpen={toggleShowAddHabitDialog}
    >
      <HabitDialogHeader isEditMode={false} />
      <HabitForm handleSubmit={handleSubmit} />
    </HabitDialog>
  );
}
