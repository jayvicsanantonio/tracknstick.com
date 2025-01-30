import { useCallback, useContext } from "react";
import { useSWRConfig } from "swr";
import { DateContext } from "@/context/DateContext";
import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";
import { Habit } from "@/types/habit";
import { apiClient } from "@/services/api";

export default function AddHabitDialog({
  showAddHabitDialog,
  toggleShowAddHabitDialog,
}: {
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
}) {
  const { mutate } = useSWRConfig();
  const { date, timeZone } = useContext(DateContext);

  const handleSubmit = useCallback(
    async (habit: Habit): Promise<void> => {
      try {
        await apiClient.post<{
          message: string;
          habitId: string;
        }>("/habits", habit);
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      } finally {
        await mutate(`/habits?date=${date.toISOString()}&timeZone=${timeZone}`);
      }
    },
    [date, timeZone, mutate]
  );

  return (
    <HabitDialog
      isOpen={showAddHabitDialog}
      toggleIsOpen={toggleShowAddHabitDialog}
    >
      <HabitDialogHeader isEditMode={false} />
      <HabitForm
        handleSubmit={handleSubmit}
        toggleDialog={toggleShowAddHabitDialog}
      />
    </HabitDialog>
  );
}
