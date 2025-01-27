import { useContext } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitDialog from "@/components/common/HabitDialog";
import HabitDialogHeader from "@/components/common/HabitDialogHeader";
import HabitForm from "@/components/common/HabitForm";
import HabitStats from "@/components/common/HabitStats";
import { ThemeContext } from "@/context/ThemeContext";
import { Habit } from "@/types/habit";

const X_API_KEY: string = import.meta.env.VITE_X_API_KEY as string;
const API_HOST: string = import.meta.env.VITE_API_HOST as string;

const client = axios.create({
  baseURL: `${API_HOST}`,
  headers: { "X-API-Key": X_API_KEY },
});

export default function EditHabitDialog({
  habit,
  setHabit,
  showEditHabitDialog,
  toggleShowEditHabitDialog,
}: {
  habit: Habit | null;
  setHabit: (habit: Habit) => void;
  showEditHabitDialog: boolean;
  toggleShowEditHabitDialog: () => void;
}) {
  const { isDarkMode } = useContext(ThemeContext);

  async function handleSubmit(habit: Habit): Promise<void> {
    try {
      await client.put<{ message: string; habitId: string }>(
        `/habits/${habit.id}`,
        habit
      );
      const newHabit = { ...habit };

      setHabit(newHabit);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }

    toggleShowEditHabitDialog();
  }

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
          <HabitForm habit={habit} handleSubmit={handleSubmit} />
        </TabsContent>
        <TabsContent value="stats" className="h-[496px]">
          <HabitStats habit={habit} />
        </TabsContent>
      </Tabs>
    </HabitDialog>
  );
}
