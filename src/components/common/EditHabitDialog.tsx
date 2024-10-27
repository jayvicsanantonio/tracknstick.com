import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";
import HabitStats from "@/components/common/HabitStats";
import { Habit } from "@/types/habit";

export default function EditHabitDialog({
  isDarkMode,
  habit,
  setHabit,
  showEditHabitDialog,
  toggleShowEditHabitDialog,
}: {
  isDarkMode: boolean;
  habit: Habit | null;
  setHabit: (habit: Habit) => void;
  showEditHabitDialog: boolean;
  toggleShowEditHabitDialog: () => void;
}) {
  return (
    <HabitDialog
      isDarkMode={isDarkMode}
      isOpen={showEditHabitDialog}
      toggleIsOpen={toggleShowEditHabitDialog}
    >
      <HabitDialogHeader isDarkMode={isDarkMode} />
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
            isDarkMode={isDarkMode}
            habit={habit}
            setHabit={setHabit}
            toggleShowAddHabitDialog={toggleShowEditHabitDialog}
          />
        </TabsContent>
        <TabsContent value="stats" className="h-[496px]">
          <HabitStats habit={habit} isDarkMode={isDarkMode} />
        </TabsContent>
      </Tabs>
    </HabitDialog>
  );
}
