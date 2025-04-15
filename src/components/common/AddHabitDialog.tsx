import { useCallback, useContext } from 'react';
import { useSWRConfig } from 'swr';
import { DateContext } from '@/context/DateContext';
import HabitDialog from '@/components/common/HabitDialog';
import HabitDialogHeader from '@/components/common/HabitDialogHeader';
import HabitForm from '@/components/common/HabitForm';
import { Habit } from '@/types/habit';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import getConfig from '@/lib/getConfig';
const { apiHost } = getConfig();

export default function AddHabitDialog({
  showAddHabitDialog,
  toggleShowAddHabitDialog,
}: {
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
}) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const { mutate } = useSWRConfig();
  const { date, timeZone } = useContext(DateContext);

  const handleSubmit = useCallback(
    async (habit: Habit): Promise<void> => {
      try {
        const token = await getToken();

        await axios.post<{
          message: string;
          habitId: string;
        }>(`${apiHost}/api/v1/habits`, habit, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    [date, timeZone, mutate, toast, getToken]
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
