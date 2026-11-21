// The progress calendar: a month of days, each past one with a ring showing how much was done.
// Moves between past months and back to this one, and explains its rings with a small key.

import { memo, useCallback, Dispatch, SetStateAction } from 'react';
import { useProgressCalendar } from '@/features/progress/hooks/useProgressCalendar';
import MonthNavButton from '@/features/progress/components/MonthNavButton';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { InsightData } from '@/features/progress/types/InsightData';
import CalendarDayCell from '@/features/progress/components/CalendarDayCell';
import { Check } from 'lucide-react';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Every month is drawn in six weeks, the most any month spans, so the
// calendar keeps one height from month to month.
const CALENDAR_CELLS = 6 * 7;

interface ProgressCalendarProps {
  insightData: InsightData[];
  selectedMonth: Date;
  setSelectedMonth: Dispatch<SetStateAction<Date>>;
  /** The month's history is still loading: past days show no result yet. */
  loading?: boolean;
}

const ProgressCalendar = memo(function ProgressCalendar({
  insightData,
  selectedMonth,
  setSelectedMonth,
  loading = false,
}: ProgressCalendarProps) {
  const { changeMonth, firstDayOfMonth, calendarDays } = useProgressCalendar(
    insightData,
    selectedMonth,
    setSelectedMonth,
  );

  const handlePreviousMonth = useCallback(() => changeMonth(-1), [changeMonth]);
  const handleNextMonth = useCallback(() => changeMonth(1), [changeMonth]);
  const handleThisMonth = useCallback(
    () => setSelectedMonth(new Date()),
    [setSelectedMonth],
  );

  // Months after this one hold nothing yet, so the calendar stops here.
  const today = new Date();
  const isThisMonth =
    selectedMonth.getFullYear() === today.getFullYear() &&
    selectedMonth.getMonth() === today.getMonth();

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="flex items-center gap-2">
        {/* A phone leaves out this year's year, so the name fits on one
            line beside "This month". Tight leading: a month of another year,
            wrapped to two lines there, still fits the buttons' height. */}
        <h2 className="mr-auto text-base leading-tight font-semibold text-(--color-foreground) sm:text-lg">
          {selectedMonth.toLocaleString('default', { month: 'long' })}
          <span
            className={
              selectedMonth.getFullYear() === today.getFullYear()
                ? 'max-sm:hidden'
                : undefined
            }
          >
            {' '}
            {selectedMonth.getFullYear()}
          </span>
        </h2>
        {/* Apart from the arrows, which hold their place whether or not it
            shows. */}
        {!isThisMonth && (
          <button
            type="button"
            onClick={handleThisMonth}
            className="min-h-11 rounded-full px-3 text-xs font-semibold whitespace-nowrap text-(--color-brand-text) ring-1 ring-(--color-border-primary)/60 transition-colors ring-inset hover:bg-(--color-brand-primary)/10 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none sm:min-h-9 dark:text-(--color-brand-text-light)"
          >
            This month
          </button>
        )}
        <div className="flex items-center gap-1">
          <MonthNavButton
            onClick={handlePreviousMonth}
            ariaLabel="Previous month"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </MonthNavButton>
          <MonthNavButton
            onClick={handleNextMonth}
            ariaLabel="Next month"
            disabled={isThisMonth}
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </MonthNavButton>
        </div>
      </div>
      {/* Six rows of one height under the weekdays: a week of empty cells
          is as tall as a week of days. */}
      <div
        className="mt-4 grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-x-1 gap-y-1.5"
        role="grid"
      >
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
          // Keyed by month as well: the 1st of another month is another
          // cell, not this one moved to a new column.
          <CalendarDayCell
            key={`${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}-${dayOfMonth}`}
            dayOfMonth={dayOfMonth}
            isPast={isPast}
            isToday={isToday}
            dayData={dayData}
            loading={loading}
          />
        ))}
        {Array.from({
          length: CALENDAR_CELLS - firstDayOfMonth - calendarDays.length,
        }).map((_, index) => (
          <div
            key={`trailing-${index}`}
            role="gridcell"
            aria-label="Empty day"
          ></div>
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
