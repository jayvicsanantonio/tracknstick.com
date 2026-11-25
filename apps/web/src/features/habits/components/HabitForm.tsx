import { useState, useCallback, useMemo, useRef, memo } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
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
import type { HabitDraft } from '@/features/habits/context/HabitsStateContextDefinition';
import { Frequency } from '@/features/habits/types/Frequency';
import HabitsIcons from '@/icons/habits';
import { useHabits } from '@/features/habits/hooks/useHabits';
import DatePickerField, { datePickerStyles } from './DatePickerField';
import IconPicker from './IconPicker';
import FrequencySelector from './FrequencySelector';
import FormActions from './FormActions';
import { useDate } from '@app/providers/useDate';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
import { triggerHaptic } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';
import {
  getLocalEndOfDayUTC,
  getLocalStartofDayUTC,
} from '@shared/utils/date/formatDate';

interface HabitFormProps {
  formId?: string;
  habit?: Habit | null;
  /** A new habit's starting values, as from a starter habit. */
  draft?: HabitDraft | null;
  toggleDialog: () => void;
}

const HabitForm = memo(function HabitForm({
  formId,
  habit,
  draft,
  toggleDialog,
}: HabitFormProps) {
  const { timeZone } = useDate();
  const { addHabit, updateHabit, deleteHabit } = useHabits();
  const prefersReducedMotion = useReducedMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [name, setName] = useState<string>(habit?.name ?? draft?.name ?? '');
  const [frequency, setFrequency] = useState<Frequency[]>(
    habit?.frequency ?? draft?.frequency ?? [],
  );
  const [icon, setIcon] = useState<keyof typeof HabitsIcons | undefined>(
    habit?.icon ?? draft?.icon,
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
  const nameSectionRef = useRef<HTMLDivElement>(null);
  const iconSectionRef = useRef<HTMLDivElement>(null);
  const datesSectionRef = useRef<HTMLDivElement>(null);
  const frequencySectionRef = useRef<HTMLDivElement>(null);

  const missingName = showValidation && !name.trim();
  const missingIcon = showValidation && !icon;
  const missingStartDate = showValidation && !startDate;
  const missingFrequency = showValidation && frequency.length === 0;

  const isValid = useMemo(
    () => Boolean(name.trim() && icon && frequency.length > 0 && startDate),
    [name, icon, frequency, startDate],
  );

  const executeDelete = useCallback(async (): Promise<void> => {
    if (!habit) return;

    triggerHaptic('warning');
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
        setShowValidation(true);

        const invalidElements = [
          !name.trim() ? nameSectionRef.current : null,
          !icon ? iconSectionRef.current : null,
          !startDate ? datesSectionRef.current : null,
          frequency.length === 0 ? frequencySectionRef.current : null,
        ].filter((el): el is HTMLDivElement => el !== null);

        invalidElements[0]?.scrollIntoView?.({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
        });

        if (!prefersReducedMotion) {
          invalidElements.forEach((el) => {
            animate(
              el,
              { x: [0, -7, 7, -5, 5, -2, 2, 0] },
              { duration: 0.36, ease: 'easeInOut' },
            );
          });
        }
        return;
      }

      setShowValidation(false);
      // Trade-off: fire optimistically inside the submit gesture because iOS
      // Safari ignores haptics after an await. On Android, a failed save plays
      // this confirmation followed by the error haptic from useHabits.
      triggerHaptic('success');
      setIsSubmitting(true);
      void handleAddOrEdit();
    },
    [
      isValid,
      handleAddOrEdit,
      name,
      icon,
      startDate,
      frequency.length,
      prefersReducedMotion,
    ],
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
          <div
            ref={nameSectionRef}
            data-invalid={missingName ? 'true' : undefined}
            className={cn(
              'space-y-1.5 rounded-2xl border bg-(--color-surface)/85 p-3.5 transition-colors dark:bg-(--color-surface-tertiary)/35',
              missingName
                ? 'border-(--color-destructive)/70'
                : 'border-(--color-border-primary)/55',
            )}
          >
            <Label
              htmlFor="habit-name"
              className="text-sm font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)"
            >
              Name
              <span className="text-(--color-error)">*</span>
            </Label>
            <Input
              id="habit-name"
              aria-invalid={missingName || undefined}
              aria-describedby={missingName ? 'habit-name-error' : undefined}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="Enter habit name"
              className="h-11 rounded-xl sm:h-10 dark:border-(--color-border-brand) dark:bg-(--color-surface-secondary) dark:placeholder:text-(--color-brand-text-light)"
            />
            {missingName ? (
              <p
                id="habit-name-error"
                role="alert"
                className="text-xs font-medium text-(--color-destructive)"
              >
                Enter a habit name
              </p>
            ) : null}
          </div>

          {/* Icon Picker Section */}
          <div
            ref={iconSectionRef}
            data-invalid={missingIcon ? 'true' : undefined}
            className={cn(
              'rounded-2xl border bg-(--color-surface)/85 p-3.5 transition-colors dark:bg-(--color-surface-tertiary)/35',
              missingIcon
                ? 'border-(--color-destructive)/70'
                : 'border-(--color-border-primary)/55',
            )}
          >
            <IconPicker
              selectedIcon={icon}
              onIconChange={(selectedIcon) => {
                triggerHaptic('selection');
                setIcon(selectedIcon);
              }}
            />
          </div>

          {/* Dates Section */}
          <div
            ref={datesSectionRef}
            data-invalid={missingStartDate ? 'true' : undefined}
            className={cn(
              'grid grid-cols-1 gap-3 rounded-2xl border bg-(--color-surface)/85 p-3.5 transition-colors sm:grid-cols-2 sm:gap-4 dark:bg-(--color-surface-tertiary)/35',
              missingStartDate
                ? 'border-(--color-destructive)/70'
                : 'border-(--color-border-primary)/55',
            )}
          >
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
          <div
            ref={frequencySectionRef}
            data-invalid={missingFrequency ? 'true' : undefined}
            className={cn(
              'rounded-2xl border bg-(--color-surface)/85 p-3.5 transition-colors dark:bg-(--color-surface-tertiary)/35',
              missingFrequency
                ? 'border-(--color-destructive)/70'
                : 'border-(--color-border-primary)/55',
            )}
          >
            <FrequencySelector
              selectedDays={frequency}
              onFrequencyChange={setFrequency}
            />
          </div>

          {/* Mobile destructive Delete Habit button (standard iOS Contacts/Calendar pattern) */}
          {habit?.id ? (
            <div className="pt-1 sm:hidden">
              <IosHapticTarget
                disabled={isSubmitting}
                className="block w-full rounded-2xl"
              >
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={requestDelete}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-(--color-destructive)/30 bg-(--color-surface)/90 px-4 text-[16px] font-semibold text-(--color-destructive) transition-colors active:bg-(--color-destructive)/10 disabled:opacity-50 dark:bg-(--color-surface-tertiary)/50"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete Habit
                </button>
              </IosHapticTarget>
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
            <IosHapticTarget className="inline-flex w-full sm:w-auto">
              <AlertDialogAction
                onClick={() => void executeDelete()}
                className="w-full bg-(--color-destructive) text-(--color-destructive-foreground) hover:opacity-90 focus:ring-(--color-ring) sm:w-auto"
              >
                Delete
              </AlertDialogAction>
            </IosHapticTarget>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default HabitForm;
