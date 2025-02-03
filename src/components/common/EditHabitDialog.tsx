import { useCallback, useContext } from "react";
import { useSWRConfig } from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";
import HabitStats from "@/components/common/HabitStats";
import { ThemeContext } from "@/context/ThemeContext";
import { DateContext } from "@/context/DateContext";
import { Habit } from "@/types/habit";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function EditHabitDialog({
  habit,
  showEditHabitDialog,
  toggleShowEditHabitDialog,
}: {
  habit: Habit | null;
  showEditHabitDialog: boolean;
  toggleShowEditHabitDialog: () => void;
}) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { isDarkMode } = useContext(ThemeContext);
  const { date, timeZone } = useContext(DateContext);

  const updateHabit = useCallback(
    async (habit: Habit): Promise<void> => {
      try {
        await apiClient.put<{ message: string; habitId: string }>(
          `/habits/${habit.id}`,
          habit
        );

        toast({
          description: `The habit "${habit.name}" has been updated.`,
        });
      } catch (error) {
        console.error("Error updating habit:", error);
        toast({
          description: `An error occurred while updating the habit: ${habit.name}`,
        });
      }
    },
    [toast]
  );

  const deleteHabit = useCallback(async (habit: Habit): Promise<void> => {
    try {
      await apiClient.delete<{ message: string; habitId: string }>(
        `/habits/${habit.id}`
      );
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw error;
    }
  }, []);

  const handleSubmit = useCallback(
    async (habit: Habit, willDelete: boolean): Promise<void> => {
      if (!habit.id) {
        throw new Error("Cannot update habit without ID");
      }

      if (willDelete) {
        await deleteHabit(habit);
      } else {
        await updateHabit(habit);
      }

      await mutate(`/habits?date=${date.toISOString()}&timeZone=${timeZone}`);
    },
    [date, timeZone, deleteHabit, mutate, updateHabit]
  );

  return (
    <HabitDialog
      isOpen={showEditHabitDialog}
      toggleIsOpen={toggleShowEditHabitDialog}
    >
      <HabitDialogHeader isEditMode={true} habit={habit} />
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger
            value="edit"
            className={`text-sm ${
              isDarkMode
                ? "data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                : "data-[state=active]:bg-purple-200"
            }`}
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className={`text-sm ${
              isDarkMode
                ? "data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                : "data-[state=active]:bg-purple-200"
            }`}
          >
            Stats
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="h-[600px] sm:h-[496px]">
          <HabitForm
            habit={habit}
            handleSubmit={handleSubmit}
            toggleDialog={toggleShowEditHabitDialog}
          />
        </TabsContent>
        <TabsContent value="stats" className="h-[496px]">
          <HabitStats habit={habit} />
        </TabsContent>
      </Tabs>
    </HabitDialog>
  );
}
