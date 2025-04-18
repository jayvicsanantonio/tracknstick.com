import { useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";
import HabitStats from "@/components/common/HabitStats";
import { ThemeContext } from "@/context/ThemeContext";
import { Habit } from "@/features/habits/types";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useHabitsState } from "@/features/habits/context/HabitsStateContext";

export default function EditHabitDialog() {
  const { isDarkMode } = useContext(ThemeContext);
  const { editingHabit, showEditHabitDialog, toggleShowEditHabitDialog } =
    useHabitsState();
  const { updateHabit, deleteHabit } = useHabits();

  const handleFormSubmit = async (
    habitDataFromForm: Habit,
    willDelete: boolean,
  ): Promise<void> => {
    const habitId = editingHabit?.id;
    if (!habitId) {
      console.error("Cannot update/delete habit without an ID.");
      return;
    }

    if (willDelete) {
      await deleteHabit(habitId, habitDataFromForm.name);
    } else {
      const { name, icon, frequency } = habitDataFromForm;
      await updateHabit(habitId, { name, icon, frequency });
    }
  };

  return (
    <HabitDialog
      isOpen={showEditHabitDialog}
      toggleIsOpen={toggleShowEditHabitDialog}
    >
      <HabitDialogHeader isEditMode={true} habit={editingHabit} />
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
        <TabsContent value="edit">
          <HabitForm
            habit={editingHabit}
            handleSubmit={handleFormSubmit}
            toggleDialog={toggleShowEditHabitDialog}
          />
        </TabsContent>
        <TabsContent value="stats">
          <HabitStats habit={editingHabit} />{" "}
        </TabsContent>
      </Tabs>
    </HabitDialog>
  );
}
