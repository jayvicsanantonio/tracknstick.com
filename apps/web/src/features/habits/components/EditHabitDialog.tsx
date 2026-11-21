import { lazy } from 'react';
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
// dialog opens: the dialog renders its content only while open, and HabitDialog
// waits for the form before it shows.
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
        <TabsList className="mb-2 grid w-full grid-cols-2 bg-(--color-muted) sm:mb-4">
          <TabsTrigger
            value="edit"
            className="data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse)"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse)"
          >
            Stats
          </TabsTrigger>
        </TabsList>
        {/* Both panels stay laid out in one cell, the hidden one invisible,
            so the dialog is as tall as the taller of them on either tab and
            does not resize when the tab changes. */}
        <div className="grid">
          <TabsContent
            value="edit"
            forceMount
            className="col-start-1 row-start-1 pt-1 data-[state=inactive]:invisible sm:pt-2"
          >
            <HabitForm
              habit={editingHabit}
              toggleDialog={toggleShowEditHabitDialog}
            />
          </TabsContent>
          <TabsContent
            value="stats"
            forceMount
            className="col-start-1 row-start-1 pt-1 data-[state=inactive]:invisible sm:pt-2"
          >
            <HabitStats habit={editingHabit} />
          </TabsContent>
        </div>
      </Tabs>
    </HabitDialog>
  );
}
