import { lazy } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog';
import HabitDialog from '@/features/habits/components/HabitDialog';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';

const HabitForm = lazy(() => import('@/features/habits/components/HabitForm'));

const FORM_ID = 'add-habit-form';

export default function AddHabitDialog() {
  const { showAddHabitDialog, toggleShowAddHabitDialog, addHabitDraft } =
    useHabitsContext();

  const mobileHeader = (
    <div className="flex items-center justify-between border-b border-(--color-border-primary)/50 px-4 pb-3 sm:hidden">
      <button
        type="button"
        onClick={toggleShowAddHabitDialog}
        className="flex min-h-9 min-w-16 items-center justify-start text-[16px] font-normal text-(--color-brand-primary) active:opacity-60"
      >
        Cancel
      </button>
      <span
        aria-hidden="true"
        className="truncate text-[17px] font-semibold tracking-tight text-(--color-foreground)"
      >
        New Habit
      </span>
      <IosHapticTarget className="inline-flex">
        <button
          type="submit"
          form={FORM_ID}
          aria-label="Add habit"
          className="flex min-h-9 min-w-16 items-center justify-end text-[16px] font-semibold text-(--color-brand-primary) active:opacity-60"
        >
          Add
        </button>
      </IosHapticTarget>
    </div>
  );

  return (
    <HabitDialog
      isOpen={showAddHabitDialog}
      toggleIsOpen={toggleShowAddHabitDialog}
      mobileHeader={mobileHeader}
    >
      {/* Keep a single accessible DialogTitle for both mobile and desktop */}
      <DialogHeader className="max-sm:sr-only sm:pb-2">
        <DialogTitle className="text-2xl font-extrabold tracking-[-0.02em] text-(--color-foreground)">
          Add New Habit
        </DialogTitle>
        <DialogDescription className="sr-only">
          Add a new habit to your list.
        </DialogDescription>
      </DialogHeader>
      <HabitForm
        formId={FORM_ID}
        draft={addHabitDraft}
        toggleDialog={toggleShowAddHabitDialog}
      />
    </HabitDialog>
  );
}
