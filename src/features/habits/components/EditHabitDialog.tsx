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
        <TabsList className="grid w-full grid-cols-2 mb-2 sm:mb-4 rounded-md overflow-hidden bg-[var(--color-surface-tertiary)] dark:bg-[var(--color-surface-secondary)]">
          <TabsTrigger
            value="edit"
            className="text-xs sm:text-sm py-1.5 sm:py-2 font-medium data-[state=active]:bg-[var(--color-active-brand)] data-[state=active]:text-[var(--color-brand-tertiary)] dark:data-[state=active]:bg-[var(--color-brand-primary)] dark:data-[state=active]:text-[var(--color-text-inverse)] dark:data-[state=inactive]:text-[var(--color-brand-text-light)] dark:focus:ring-[var(--color-brand-text-light)]"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="text-xs sm:text-sm py-1.5 sm:py-2 font-medium data-[state=active]:bg-[var(--color-active-brand)] data-[state=active]:text-[var(--color-brand-tertiary)] dark:data-[state=active]:bg-[var(--color-brand-primary)] dark:data-[state=active]:text-[var(--color-text-inverse)] dark:data-[state=inactive]:text-[var(--color-brand-text-light)] dark:focus:ring-[var(--color-brand-text-light)]"
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
