// The progress calendar: a month of days, each past one with a ring showing how much was done.
// Moves between months, and explains its rings with a small key.

import { memo, useCallback, Dispatch, SetStateAction } from 'react';
import { useProgressCalendar } from '@/features/progress/hooks/useProgressCalendar';
import MonthNavButton from '@/features/progress/components/MonthNavButton';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { InsightData } from '@/features/progress/types/InsightData';
import CalendarDayCell from '@/features/progress/components/CalendarDayCell';
import { Check } from 'lucide-react';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ProgressCalendarProps {
  insightData: InsightData[];
  selectedMonth: Date;
  setSelectedMonth: Dispatch<SetStateAction<Date>>;
}

const ProgressCalendar = memo(function ProgressCalendar({
  insightData,
  selectedMonth,
  setSelectedMonth,
}: ProgressCalendarProps) {
  const { changeMonth, firstDayOfMonth, calendarDays } = useProgressCalendar(
    insightData,
    selectedMonth,
    setSelectedMonth,
  );

  const handlePreviousMonth = useCallback(() => changeMonth(-1), [changeMonth]);
  const handleNextMonth = useCallback(() => changeMonth(1), [changeMonth]);

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-(--color-foreground) sm:text-lg">
          {selectedMonth.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="flex gap-1">
          <MonthNavButton
            onClick={handlePreviousMonth}
            ariaLabel="Previous month"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </MonthNavButton>
          <MonthNavButton onClick={handleNextMonth} ariaLabel="Next month">
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </MonthNavButton>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-x-1 gap-y-1.5" role="grid">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="pb-1 text-center text-[11px] font-medium tracking-wide text-(--color-text-secondary) uppercase"
            role="columnheader"
            aria-label={day}
          >
            {day.slice(0, 1)}
            <span className="hidden sm:inline">{day.slice(1)}</span>
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div
            key={`empty-${index}`}
            role="gridcell"
            aria-label="Empty day"
          ></div>
        ))}
        {calendarDays.map(({ dayOfMonth, isPast, isToday, dayData }) => (
          <CalendarDayCell
            key={dayOfMonth}
            dayOfMonth={dayOfMonth}
            isPast={isPast}
            isToday={isToday}
            dayData={dayData}
          />
        ))}
      </div>
      {/* Each cell names its own rate; the key is for sighted readers. */}
      <div
        aria-hidden="true"
        className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-(--color-text-secondary)"
      >
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 36 36" className="size-4 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15"
              strokeWidth="4"
              className="fill-none stroke-(--color-brand-primary)/15"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="94.25"
              strokeDashoffset="47"
              className="fill-none stroke-(--color-brand-primary)"
            />
          </svg>
          Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex size-4 items-center justify-center rounded-full bg-(--color-brand-primary)/15 ring-2 ring-(--color-brand-primary) ring-inset">
            <Check
              strokeWidth={4}
              className="size-2.5 text-(--color-brand-primary)"
            />
          </span>
          Perfect day
        </span>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 36 36" className="size-4">
            <circle
              cx="18"
              cy="18"
              r="15"
              strokeWidth="4"
              strokeDasharray="2 3.5"
              className="fill-none stroke-(--color-border-primary)"
            />
          </svg>
          Nothing scheduled
        </span>
      </div>
    </div>
  );
});

export default ProgressCalendar;
