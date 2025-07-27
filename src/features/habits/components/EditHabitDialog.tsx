import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components/ui/tabs';
import HabitDialog from '@/features/habits/components/HabitDialog';
import HabitDialogHeader from '@/features/habits/components/HabitDialogHeader';
import HabitForm from '@/features/habits/components/HabitForm';
import HabitStats from '@/features/habits/components/HabitStats';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

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
        <TabsList className="bg-(--color-surface-tertiary) dark:bg-(--color-surface-secondary) mb-2 grid w-full grid-cols-2 overflow-hidden rounded-md sm:mb-4">
          <TabsTrigger
            value="edit"
            className="data-[state=active]:bg-(--color-active-brand) data-[state=active]:text-(--color-brand-tertiary) dark:focus:ring-(--color-brand-text-light) dark:data-[state=active]:bg-(--color-brand-primary) dark:data-[state=active]:text-(--color-text-inverse) dark:data-[state=inactive]:text-(--color-brand-text-light) py-1.5 text-xs font-medium sm:py-2 sm:text-sm"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-(--color-active-brand) data-[state=active]:text-(--color-brand-tertiary) dark:focus:ring-(--color-brand-text-light) dark:data-[state=active]:bg-(--color-brand-primary) dark:data-[state=active]:text-(--color-text-inverse) dark:data-[state=inactive]:text-(--color-brand-text-light) py-1.5 text-xs font-medium sm:py-2 sm:text-sm"
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
