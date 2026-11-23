// The progress calendar: a month of days, each past one with a ring showing how much was done.
// Supports horizontal touch swipes between months and tapping a past day to jump to it on Tracker.

import { memo, useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { useProgressCalendar } from '@/features/progress/hooks/useProgressCalendar';
import MonthNavButton from '@/features/progress/components/MonthNavButton';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { InsightData } from '@/features/progress/types/InsightData';
import CalendarDayCell from '@/features/progress/components/CalendarDayCell';
import { triggerHaptic } from '@shared/utils/haptics';
import { Check } from 'lucide-react';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CALENDAR_CELLS = 6 * 7;
const MONTH_SWIPE_THRESHOLD = 52;

interface ProgressCalendarProps {
  insightData: InsightData[];
  selectedMonth: Date;
  setSelectedMonth: Dispatch<SetStateAction<Date>>;
  /** The month's history is still loading: past days show no result yet. */
  loading?: boolean;
  /** Called when the user taps a past or current day in the calendar. */
  onSelectDate?: (date: Date) => void;
}

const ProgressCalendar = memo(function ProgressCalendar({
  insightData,
  selectedMonth,
  setSelectedMonth,
  loading = false,
  onSelectDate,
}: ProgressCalendarProps) {
  const { changeMonth, firstDayOfMonth, calendarDays } = useProgressCalendar(
    insightData,
    selectedMonth,
    setSelectedMonth,
  );
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handlePreviousMonth = useCallback(() => {
    triggerHaptic('selection');
    changeMonth(-1);
  }, [changeMonth]);

  const handleNextMonth = useCallback(() => {
    triggerHaptic('selection');
    changeMonth(1);
  }, [changeMonth]);

  const handleThisMonth = useCallback(() => {
    triggerHaptic('selection');
    setSelectedMonth(new Date());
  }, [setSelectedMonth]);

  const today = new Date();
  const isThisMonth =
    selectedMonth.getFullYear() === today.getFullYear() &&
    selectedMonth.getMonth() === today.getMonth();

  const handleDaySelect = useCallback(
    (dayOfMonth: number) => {
      if (!onSelectDate) return;
      onSelectDate(
        new Date(
          selectedMonth.getFullYear(),
          selectedMonth.getMonth(),
          dayOfMonth,
          12,
          0,
          0,
        ),
      );
    },
    [onSelectDate, selectedMonth],
  );

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (
      Math.abs(dx) >= MONTH_SWIPE_THRESHOLD &&
      Math.abs(dx) > Math.abs(dy) * 1.4
    ) {
      if (dx > 0) {
        handlePreviousMonth();
      } else if (!isThisMonth) {
        handleNextMonth();
      }
    }
  };

  return (
    <div
      className="mx-auto w-full max-w-lg sm:max-w-none lg:flex lg:flex-1 lg:flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex h-9 items-center gap-2">
        <h2 className="mr-auto text-[18px] leading-tight font-bold tracking-[-0.02em] text-(--color-foreground)">
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
        {!isThisMonth && (
          <button
            type="button"
            onClick={handleThisMonth}
            className="flex h-9 items-center rounded-full bg-(--color-brand-primary)/14 px-3 text-xs font-semibold whitespace-nowrap text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/24 transition-[background-color,transform] ring-inset hover:bg-(--color-brand-primary)/20 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-95 dark:text-(--color-brand-text-light)"
          >
            This month
          </button>
        )}
        <div className="flex items-center gap-1.5">
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

      <div
        className="mt-3.5 grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-x-1 gap-y-1.5 lg:flex-1"
        role="grid"
      >
        <div
          role="row"
          className="col-span-7 mb-1 grid grid-cols-7 gap-x-1 rounded-xl bg-(--color-brand-primary)/[0.07] py-1.5"
        >
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-semibold tracking-wide text-(--color-text-secondary) uppercase"
              role="columnheader"
              aria-label={day}
            >
              {day.slice(0, 1)}
              <span className="hidden sm:inline">{day.slice(1)}</span>
            </div>
          ))}
        </div>
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div
            key={`empty-${index}`}
            role="gridcell"
            aria-label="Empty day"
          ></div>
        ))}
        {calendarDays.map(({ dayOfMonth, isPast, isToday, dayData }) => (
          <CalendarDayCell
            key={`${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}-${dayOfMonth}`}
            dayOfMonth={dayOfMonth}
            isPast={isPast}
            isToday={isToday}
            dayData={dayData}
            loading={loading}
            onSelect={onSelectDate ? handleDaySelect : undefined}
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

      <div
        aria-hidden="true"
        className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-(--color-brand-primary)/12 pt-3.5 text-xs text-(--color-text-secondary)"
      >
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 36 36" className="size-4 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15"
              strokeWidth="4"
              className="fill-none stroke-(--color-brand-primary)/18"
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
          <span className="flex size-4 items-center justify-center rounded-full bg-(--color-brand-primary)/16 ring-2 ring-(--color-brand-primary) ring-inset">
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
              className="fill-none stroke-(--color-text-secondary)/35"
            />
          </svg>
          Nothing scheduled
        </span>
      </div>
      {onSelectDate ? (
        <>
          <p className="mt-2.5 text-center text-[11px] text-(--color-text-secondary)/65 sm:hidden">
            Tap a day to open in Tracker · Swipe to change month
          </p>
          <p className="mt-2.5 hidden text-center text-xs text-(--color-text-secondary)/65 sm:block">
            Click a day to open in Tracker
          </p>
        </>
      ) : null}
    </div>
  );
});

export default ProgressCalendar;
