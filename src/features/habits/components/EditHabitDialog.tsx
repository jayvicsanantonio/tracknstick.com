import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitDialog from "@/features/habits/components/HabitDialog";
import HabitDialogHeader from "@/features/habits/components/HabitDialogHeader";
import HabitForm from "@/features/habits/components/HabitForm";
import HabitStats from "@/features/habits/components/HabitStats";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";

export default function EditHabitDialog() {
  const { editingHabit, showEditHabitDialog, toggleShowEditHabitDialog } =
    useHabitsContext();

  return (
    <HabitDialog
      isOpen={showEditHabitDialog}
      toggleIsOpen={toggleShowEditHabitDialog}
    >
      <HabitDialogHeader isEditMode={true} habit={editingHabit} />
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-2 sm:mb-4 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="edit"
            className="text-xs sm:text-sm py-1.5 sm:py-2 font-medium data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-600 dark:data-[state=active]:text-white dark:data-[state=inactive]:text-purple-200 dark:focus:ring-purple-400"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="text-xs sm:text-sm py-1.5 sm:py-2 font-medium data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-600 dark:data-[state=active]:text-white dark:data-[state=inactive]:text-purple-200 dark:focus:ring-purple-400"
          >
            Stats
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="pt-1 sm:pt-2">
          <HabitForm
            habit={editingHabit}
            toggleDialog={toggleShowEditHabitDialog}
          />
        </TabsContent>
        <TabsContent value="stats" className="pt-1 sm:pt-2">
          <HabitStats habit={editingHabit} />
        </TabsContent>
      </Tabs>
    </HabitDialog>
  );
}
