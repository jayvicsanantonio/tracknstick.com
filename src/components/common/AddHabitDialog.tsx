import { useCallback, useContext } from 'react';
import { useSWRConfig } from 'swr';
import { DateContext } from '@/context/DateContext';
import HabitDialog from '@/components/common/HabitDialog';
import HabitDialogHeader from '@/components/common/HabitDialogHeader';
import HabitForm from '@/components/common/HabitForm';
import { Habit } from '@/types/habit';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function AddHabitDialog({
  showAddHabitDialog,
  toggleShowAddHabitDialog,
}: {
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
}) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { date, timeZone } = useContext(DateContext);

  const handleSubmit = useCallback(
    async (habit: Habit): Promise<void> => {
      try {
        await apiClient.post<{
          message: string;
          habitId: string;
        }>('/api/v1/habits', habit);

        toast({
          description: `The habit "${habit.name}" has been added.`,
        });
      } catch (error) {
        console.error(error);
        toast({
          description: `An error occurred while adding the habit: ${habit.name}`,
        });
      } finally {
        await mutate(
          `/api/v1/habits?date=${date.toISOString()}&timeZone=${timeZone}`
        );
      }
    },
    [date, timeZone, mutate, toast]
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
