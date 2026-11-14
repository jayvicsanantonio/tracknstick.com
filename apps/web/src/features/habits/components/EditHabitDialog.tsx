import { lazy, Suspense } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components/ui/tabs';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import HabitsIcons from '@/icons/habits';
import HabitDialog from '@/features/habits/components/HabitDialog';
import HabitStats from '@/features/habits/components/HabitStats';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

// The form, and the date picker it carries, download the first time a habit
// dialog opens: the dialog renders its content only while open.
const HabitForm = lazy(() => import('@/features/habits/components/HabitForm'));

export default function EditHabitDialog() {
  const { editingHabit, showEditHabitDialog, toggleShowEditHabitDialog } =
    useHabitsContext();

  const HabitIcon = editingHabit ? HabitsIcons[editingHabit.icon] : null;

  return (
    <HabitDialog
      isOpen={showEditHabitDialog}
      toggleIsOpen={toggleShowEditHabitDialog}
    >
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-(--color-brand-tertiary) dark:text-(--color-brand-text-light)">
          {HabitIcon && <HabitIcon className="mr-2 inline-block h-8 w-8" />}
          {editingHabit?.name}
        </DialogTitle>
        <DialogDescription>
          {editingHabit ? frequencyLabel(editingHabit.frequency) : null}
        </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-2 grid w-full grid-cols-2 overflow-hidden rounded-md bg-(--color-surface-tertiary) sm:mb-4 dark:bg-(--color-surface-secondary)">
          <TabsTrigger
            value="edit"
            className="py-1.5 text-xs font-medium data-[state=active]:bg-(--color-active-brand) data-[state=active]:text-(--color-brand-tertiary) sm:py-2 sm:text-sm dark:focus:ring-(--color-brand-text-light) dark:data-[state=active]:bg-(--color-brand-primary) dark:data-[state=active]:text-(--color-text-inverse) dark:data-[state=inactive]:text-(--color-brand-text-light)"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="py-1.5 text-xs font-medium data-[state=active]:bg-(--color-active-brand) data-[state=active]:text-(--color-brand-tertiary) sm:py-2 sm:text-sm dark:focus:ring-(--color-brand-text-light) dark:data-[state=active]:bg-(--color-brand-primary) dark:data-[state=active]:text-(--color-text-inverse) dark:data-[state=inactive]:text-(--color-brand-text-light)"
          >
            Stats
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="pt-1 sm:pt-2">
          <Suspense fallback={null}>
            <HabitForm
              habit={editingHabit}
              toggleDialog={toggleShowEditHabitDialog}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="stats" className="pt-1 sm:pt-2">
          <HabitStats habit={editingHabit} />
        </TabsContent>
      </Tabs>
    </HabitDialog>
  );
}
