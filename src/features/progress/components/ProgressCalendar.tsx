import { memo, useCallback, Dispatch, SetStateAction } from 'react';
import { useProgressCalendar } from '@/features/progress/hooks/useProgressCalendar';
import MonthNavButton from '@/features/progress/components/MonthNavButton';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { InsightData } from '@/features/progress/types/InsightData';
import CalendarDayCircle from '@/features/progress/components/CalendarDayCircle';

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
    <div>
      <div className="flex items-center justify-between">
        <MonthNavButton
          onClick={handlePreviousMonth}
          ariaLabel="Previous Month"
        >
          <ChevronLeft
            aria-hidden="true"
            className="text-(--color-text-primary) dark:text-(--color-brand-text-light) h-4 w-4"
          />
        </MonthNavButton>
        <h3 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-lg font-semibold">
          {selectedMonth.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <MonthNavButton onClick={handleNextMonth} ariaLabel="Next Month">
          <ChevronRight
            aria-hidden="true"
            className="text-(--color-text-primary) dark:text-(--color-brand-text-light) h-4 w-4"
          />
        </MonthNavButton>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1" role="grid">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-center text-xs font-bold"
            role="columnheader"
            aria-label={day}
          >
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-square"
            role="gridcell"
            aria-label="Empty day"
          ></div>
        ))}
        {calendarDays.map(({ dayOfMonth, isPast, isToday, dayData }, index) => (
          <div
            key={index}
            className="flex aspect-square flex-col items-center justify-center p-1"
            role="gridcell"
            aria-label={`Day ${dayOfMonth}`}
          >
            <span
              aria-hidden="true"
              className={`mb-1 text-xs font-medium ${
                isPast || isToday
                  ? 'text-(--color-brand-tertiary) dark:text-(--color-brand-text-light)'
                  : 'text-(--color-text-tertiary) dark:text-(--color-brand-secondary)'
              }`}
            >
              {dayOfMonth}
            </span>
            {isPast || isToday ? (
              <CalendarDayCircle
                dayData={dayData}
                isPast={isPast}
                isToday={isToday}
              />
            ) : (
              <CalendarDayCircle
                dayData={undefined}
                isPast={false}
                isToday={false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProgressCalendar;
