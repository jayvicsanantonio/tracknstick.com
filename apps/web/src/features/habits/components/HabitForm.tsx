import { useState, useCallback, useMemo, memo } from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import 'react-datepicker/dist/react-datepicker.css';
import { Habit, HabitPayload } from '@/features/habits/types/Habit';
import { Frequency } from '@/features/habits/types/Frequency';
import HabitsIcons from '@/icons/habits';
import { useHabits } from '@/features/habits/hooks/useHabits';
import DatePickerField, { datePickerStyles } from './DatePickerField';
import IconPicker from './IconPicker';
import FrequencySelector from './FrequencySelector';
import FormActions from './FormActions';
import { useDate } from '@app/providers/useDate';
import { triggerHaptic } from '@shared/utils/haptics';
import {
  getLocalEndOfDayUTC,
  getLocalStartofDayUTC,
} from '@shared/utils/date/formatDate';

interface HabitFormProps {
  formId?: string;
  habit?: Habit | null;
  toggleDialog: () => void;
}

const HabitForm = memo(function HabitForm({
  formId,
  habit,
  toggleDialog,
}: HabitFormProps) {
  const { timeZone } = useDate();
  const { addHabit, updateHabit, deleteHabit } = useHabits();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [name, setName] = useState<string>(habit?.name ?? '');
  const [frequency, setFrequency] = useState<Frequency[]>(
    habit?.frequency ?? [],
  );
  const [icon, setIcon] = useState<keyof typeof HabitsIcons | undefined>(
    habit?.icon,
  );
  const [startDate, setStartDate] = useState<Date | null>(
    habit?.startDate
      ? getLocalStartofDayUTC(new Date(habit.startDate), timeZone)
      : getLocalStartofDayUTC(new Date(), timeZone),
  );
  const [endDate, setEndDate] = useState<Date | null>(
    habit?.endDate
      ? getLocalEndOfDayUTC(new Date(habit.endDate), timeZone)
      : null,
  );
  const isValid = useMemo(
    () => Boolean(name.trim() && icon && frequency.length > 0 && startDate),
    [name, icon, frequency, startDate],
  );

  const executeDelete = useCallback(async (): Promise<void> => {
    if (!habit) return;

    triggerHaptic('medium');
    setIsSubmitting(true);
    setConfirmDeleteOpen(false);
    try {
      await deleteHabit(habit.id, habit.name);
    } catch (error) {
      console.error('Failed to delete habit:', error);
    } finally {
      toggleDialog();
    }
  }, [habit, deleteHabit, toggleDialog]);

  const requestDelete = useCallback(() => {
    triggerHaptic('light');
    setConfirmDeleteOpen(true);
  }, []);

  const handleAddOrEdit = useCallback(async () => {
    try {
      if (!icon || !startDate) return;

      const habitData: HabitPayload = {
        name: name.trim(),
        icon,
        frequency,
        startDate: getLocalStartofDayUTC(startDate, timeZone),
        ...(endDate ? { endDate: getLocalEndOfDayUTC(endDate, timeZone) } : {}),
      };

      if (habit?.id) {
        await updateHabit(habit.id, habitData);
      } else {
        await addHabit(habitData);
      }
      triggerHaptic('success');
    } catch (error) {
      console.error('Failed to save habit:', error);
    } finally {
      setIsSubmitting(false);
      toggleDialog();
    }
  }, [
    name,
    icon,
    frequency,
    startDate,
    endDate,
    habit,
    updateHabit,
    addHabit,
    toggleDialog,
    timeZone,
  ]);

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      if (!isValid) {
        triggerHaptic('error');
        return;
      }
      setIsSubmitting(true);
      void handleAddOrEdit();
    },
    [isValid, handleAddOrEdit],
  );

  return (
    <>
      <style>{datePickerStyles}</style>
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="text-foreground flex min-h-0 flex-1 flex-col gap-3 sm:gap-4"
      >
        {/* Scrollable fields organised into clean inset grouped sections across all viewports */}
        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1.75rem)] [scrollbar-color:var(--color-border-brand)_transparent] [scrollbar-width:thin] sm:space-y-3 sm:px-0.5 sm:pt-1 sm:pb-1">
          {/* Name Section */}
          <div className="space-y-1.5 rounded-2xl border border-(--color-border-primary)/55 bg-(--color-surface)/85 p-3.5 dark:bg-(--color-surface-tertiary)/35">
            <Label
              htmlFor="habit-name"
              className="text-sm font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)"
            >
              Name
              <span className="text-(--color-error)">*</span>
            </Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="Enter habit name"
              className="h-11 rounded-xl sm:h-10 dark:border-(--color-border-brand) dark:bg-(--color-surface-secondary) dark:placeholder:text-(--color-brand-text-light)"
            />
          </div>

          {/* Icon Picker Section */}
          <div className="rounded-2xl border border-(--color-border-primary)/55 bg-(--color-surface)/85 p-3.5 dark:bg-(--color-surface-tertiary)/35">
            <IconPicker
              selectedIcon={icon}
              onIconChange={(selectedIcon) => {
                triggerHaptic('selection');
                setIcon(selectedIcon);
              }}
            />
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-(--color-border-primary)/55 bg-(--color-surface)/85 p-3.5 sm:grid-cols-2 sm:gap-4 dark:bg-(--color-surface-tertiary)/35">
            <DatePickerField
              id="start-date"
              label="Start Date"
              selected={startDate}
              onChange={setStartDate}
              placeholder="Select start date"
              isRequired={true}
            />
            <DatePickerField
              id="end-date"
              label="End Date (Optional)"
              selected={endDate}
              onChange={setEndDate}
              placeholder="mm / dd / yyyy"
              isClearable={true}
            />
          </div>

          {/* Frequency Section */}
          <div className="rounded-2xl border border-(--color-border-primary)/55 bg-(--color-surface)/85 p-3.5 dark:bg-(--color-surface-tertiary)/35">
            <FrequencySelector
              selectedDays={frequency}
              onFrequencyChange={setFrequency}
            />
          </div>

          {/* Mobile destructive Delete Habit button (standard iOS Contacts/Calendar pattern) */}
          {habit?.id ? (
            <div className="pt-1 sm:hidden">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={requestDelete}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-(--color-destructive)/30 bg-(--color-surface)/90 px-4 text-[16px] font-semibold text-(--color-destructive) transition-colors active:bg-(--color-destructive)/10 disabled:opacity-50 dark:bg-(--color-surface-tertiary)/50"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete Habit
              </button>
            </div>
          ) : null}
        </div>

        {/* Desktop footer action bar (on mobile Cancel / Add / Save sit in the iOS top sheet header) */}
        <div className="hidden border-t border-(--color-border-primary)/40 pt-4 sm:block">
          <FormActions
            isSubmitting={isSubmitting}
            onDelete={habit?.id ? requestDelete : undefined}
            habit={habit}
          />
        </div>
      </form>

      {/* Confirm-before-delete Action Sheet (mobile) / Frosted Modal (desktop) */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="text-(--color-card-foreground)">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-(--color-foreground)">
              Delete Habit
            </AlertDialogTitle>
            <AlertDialogDescription className="text-(--color-text-secondary)">
              Are you sure you want to delete &quot;{habit?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-(--color-muted) text-(--color-foreground) hover:bg-(--color-hover-surface)">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void executeDelete()}
              className="bg-(--color-destructive) text-(--color-destructive-foreground) hover:opacity-90 focus:ring-(--color-ring)"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default HabitForm;
