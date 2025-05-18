import { useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitDialog from "@/features/habits/components/HabitDialog";
import HabitDialogHeader from "@/features/habits/components/HabitDialogHeader";
import HabitForm from "@/features/habits/components/HabitForm";
import HabitStats from "@/features/habits/components/HabitStats";
import { ThemeContext } from "@/context/ThemeContext";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";

export default function EditHabitDialog() {
  const { isDarkMode } = useContext(ThemeContext);
  const { editingHabit, showEditHabitDialog, toggleShowEditHabitDialog } =
    useHabitsContext();

  return (
    <HabitDialog
      isOpen={showEditHabitDialog}
      toggleIsOpen={toggleShowEditHabitDialog}
    >
      <HabitDialogHeader isEditMode={true} habit={editingHabit} />
      <Tabs defaultValue="edit" className="w-full">
        <TabsList
          className={`grid w-full grid-cols-2 mb-2 sm:mb-4 rounded-md overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <TabsTrigger
            value="edit"
            className={`text-xs sm:text-sm py-1.5 sm:py-2 ${
              isDarkMode
                ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-purple-200 focus:ring-purple-400"
                : "data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800"
            } font-medium`}
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className={`text-xs sm:text-sm py-1.5 sm:py-2 ${
              isDarkMode
                ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-purple-200 focus:ring-purple-400"
                : "data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800"
            } font-medium`}
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
