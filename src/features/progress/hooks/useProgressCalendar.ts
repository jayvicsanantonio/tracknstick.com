import { useMemo } from 'react';
import { InsightData } from '@/features/progress/types/InsightData';
import { CalendarDay } from '@/features/progress/types/CalendarDay';
import { toDateKey } from '@/features/progress/utils/dateKeys';

export function useProgressCalendar(
  insightData: InsightData[],
  currentDate: Date,
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>,
) {
  const changeMonth = (increment: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Indexed by full date. Matching on day-of-month alone let a neighbouring
  // month's row -- which the requested range can include, since its bounds are
  // local midnights -- answer for a cell in this month.
  const byDate = useMemo(
    () => new Map(insightData.map((entry) => [entry.date, entry])),
    [insightData],
  );

  const calendarDays: CalendarDay[] = useMemo(() => {
    const today = new Date();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayOfMonth = i + 1;
      const date = new Date(year, month, dayOfMonth);
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();

      // The hook owns "a future day has no data" so the calendar component
      // does not decide it a second time.
      const dayData =
        isPast || isToday ? byDate.get(toDateKey(date)) : undefined;

      return { dayOfMonth, isPast, isToday, date, dayData };
    });
  }, [daysInMonth, year, month, byDate]);

  return {
    changeMonth,
    firstDayOfMonth,
    calendarDays,
  };
}
