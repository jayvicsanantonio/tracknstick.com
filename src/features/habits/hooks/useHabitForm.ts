import { useState, useCallback, useMemo, useContext } from 'react';
import { Habit } from '@/features/habits/types/Habit';
import { Frequency } from '@/features/habits/types/Frequency';
import HabitsIcons from '@/icons/habits';
import { DateContext } from '@app/providers/DateContext';
import {
  getLocalEndOfDayUTC,
  getLocalStartofDayUTC,
} from '@shared/utils/date/formatDate';

interface UseHabitFormProps {
  habit?: Habit | null;
  onSubmit: (habitData: Partial<Habit>) => Promise<void>;
}

export function useHabitForm({ habit, onSubmit }: UseHabitFormProps) {
  const { timeZone } = useContext(DateContext);

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
    () => Boolean(name && icon && frequency.length > 0 && startDate),
    [name, icon, frequency, startDate],
  );

  const handleSubmit = useCallback(async () => {
    if (!isValid || !icon || !startDate) return;

    setIsSubmitting(true);
    try {
      const habitData = {
        name,
        icon,
        frequency,
        startDate: getLocalStartofDayUTC(startDate, timeZone),
        ...(endDate ? { endDate: getLocalEndOfDayUTC(endDate, timeZone) } : {}),
      };

      await onSubmit(habitData);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, icon, frequency, startDate, endDate, isValid, onSubmit, timeZone]);

  return {
    formState: {
      name,
      frequency,
      icon,
      startDate,
      endDate,
      isSubmitting,
      isValid,
    },
    formActions: {
      setName,
      setFrequency,
      setIcon,
      setStartDate,
      setEndDate,
      handleSubmit,
    },
  };
}
