import { useContext, useState, useCallback, useMemo, memo } from 'react';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Separator } from '@shared/components/ui/separator';
import 'react-datepicker/dist/react-datepicker.css';
import { Habit } from '@/features/habits/types/Habit';
import { Frequency } from '@/features/habits/types/Frequency';
import HabitsIcons from '@/icons/habits';
import { useHabits } from '@/features/habits/hooks/useHabits';
import DatePickerField, { datePickerStyles } from './DatePickerField';
import IconPicker from './IconPicker';
import FrequencySelector from './FrequencySelector';
import FormActions from './FormActions';
import { DateContext } from '@app/providers/DateContext';
import {
  getLocalEndOfDayUTC,
  getLocalStartofDayUTC,
} from '@shared/utils/date/formatDate';
interface HabitFormProps {
  habit?: Habit | null;
  toggleDialog: () => void;
}

const HabitForm = memo(function HabitForm({
  habit,
  toggleDialog,
}: HabitFormProps) {
  const { timeZone } = useContext(DateContext);
  const { addHabit, updateHabit, deleteHabit } = useHabits();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    () => name && icon && frequency.length > 0 && startDate,
    [name, icon, frequency, startDate],
  );

  const handleDelete = useCallback(
    async (habitId: string): Promise<void> => {
      if (!habit) return;

      setIsSubmitting(true);
      try {
        await deleteHabit(habitId, habit.name);
      } catch (error) {
        console.error('Failed to delete habit:', error);
      } finally {
        toggleDialog();
      }
    },
    [habit, deleteHabit, toggleDialog],
  );

  const handleAddOrEdit = useCallback(async () => {
    try {
      if (!icon || !startDate) return;

      const habitData = {
        name,
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
    setIsSubmitting,
    toggleDialog,
    timeZone,
  ]);

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      if (!isValid) return;
      setIsSubmitting(true);
      void handleAddOrEdit();
    },
    [isValid, handleAddOrEdit],
  );

  return (
    <>
      <style>{datePickerStyles}</style>
      <form
        onSubmit={handleSubmit}
        className="text-foreground grid max-h-[70vh] min-h-fit gap-3 overflow-y-auto py-2 sm:h-auto sm:max-h-none sm:gap-4 sm:py-4"
      >
        <div className="space-y-3 px-1 sm:space-y-4">
          {/* Name Input */}
          <div className="space-y-1 sm:space-y-2">
            <Label
              htmlFor="habit-name"
              className="text-(--color-brand-text) dark:text-(--color-brand-text-light) text-sm sm:text-base"
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
              className="dark:border-(--color-border-brand) dark:bg-(--color-surface-secondary) dark:placeholder:text-(--color-brand-text-light)"
            />
          </div>

          <IconPicker
            selectedIcon={icon}
            onIconChange={(selectedIcon) => setIcon(selectedIcon)}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <DatePickerField
              id="start-date"
              label="Start Date"
              selected={startDate}
              onChange={setStartDate}
              placeholder="Select start date"
              isRequired={true}
              heightClass="h-14 sm:h-16"
            />
            <DatePickerField
              id="end-date"
              label="End Date (Optional)"
              selected={endDate}
              onChange={setEndDate}
              placeholder="mm / dd / yyyy"
              isClearable={true}
              heightClass="h-14 sm:h-16"
            />
          </div>

          <FrequencySelector
            selectedDays={frequency}
            onFrequencyChange={setFrequency}
          />
        </div>

        <Separator className="bg-(--color-border-brand) dark:bg-(--color-brand-light) my-2" />

        <FormActions
          isSubmitting={isSubmitting}
          onDelete={handleDelete}
          habit={habit}
        />
      </form>
    </>
  );
});

export default HabitForm;
