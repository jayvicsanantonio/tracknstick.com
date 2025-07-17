import { useProgressCalendar } from '@/features/progress/hooks/useProgressCalendar';
import MonthNavButton from '@/features/progress/components/MonthNavButton';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { InsightData } from '@/features/progress/types/InsightData';
import CalendarDayCircle from '@/features/progress/components/CalendarDayCircle';
import { Dispatch, SetStateAction } from 'react';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProgressCalendar({
  insightData,
  selectedMonth,
  setSelectedMonth,
}: {
  insightData: InsightData[];
  selectedMonth: Date;
  setSelectedMonth: Dispatch<SetStateAction<Date>>;
}) {
  const { changeMonth, firstDayOfMonth, calendarDays } = useProgressCalendar(
    insightData,
    selectedMonth,
    setSelectedMonth,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <MonthNavButton
          onClick={() => changeMonth(-1)}
          ariaLabel="Previous Month"
        >
          <ChevronLeft
            aria-hidden="true"
            className="h-4 w-4 text-(--color-text-primary) dark:text-(--color-brand-text-light)"
          />
        </MonthNavButton>
        <h3 className="text-lg font-semibold text-(--color-brand-tertiary) dark:text-(--color-brand-text-light)">
          {selectedMonth.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <MonthNavButton onClick={() => changeMonth(1)} ariaLabel="Next Month">
          <ChevronRight
            aria-hidden="true"
            className="h-4 w-4 text-(--color-text-primary) dark:text-(--color-brand-text-light)"
          />
        </MonthNavButton>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1" role="grid">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-(--color-brand-tertiary) dark:text-(--color-brand-text-light)"
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
}
