import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HabitDialog from '@/features/habits/components/HabitDialog';
import HabitDialogHeader from '@/features/habits/components/HabitDialogHeader';
import HabitForm from '@/features/habits/components/HabitForm';
import HabitStats from '@/features/habits/components/HabitStats';
import { useHabitsContext } from '@/features/habits/context/HabitsStateContext';

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
        <TabsList className="mb-2 grid w-full grid-cols-2 overflow-hidden rounded-md bg-[var(--color-surface-tertiary)] sm:mb-4 dark:bg-[var(--color-surface-secondary)]">
          <TabsTrigger
            value="edit"
            className="py-1.5 text-xs font-medium data-[state=active]:bg-[var(--color-active-brand)] data-[state=active]:text-[var(--color-brand-tertiary)] sm:py-2 sm:text-sm dark:focus:ring-[var(--color-brand-text-light)] dark:data-[state=active]:bg-[var(--color-brand-primary)] dark:data-[state=active]:text-[var(--color-text-inverse)] dark:data-[state=inactive]:text-[var(--color-brand-text-light)]"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="py-1.5 text-xs font-medium data-[state=active]:bg-[var(--color-active-brand)] data-[state=active]:text-[var(--color-brand-tertiary)] sm:py-2 sm:text-sm dark:focus:ring-[var(--color-brand-text-light)] dark:data-[state=active]:bg-[var(--color-brand-primary)] dark:data-[state=active]:text-[var(--color-text-inverse)] dark:data-[state=inactive]:text-[var(--color-brand-text-light)]"
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
