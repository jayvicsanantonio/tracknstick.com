import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProgressCalendar } from "@/features/progress/hooks/useProgressCalendar";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

interface InsightData {
  date: string;
  completionRate: number;
}

interface ProgressCalendarProps {
  insightData: InsightData[];
  isDarkMode: boolean;
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthNavButton({
  onClick,
  isDarkMode,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  isDarkMode: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      aria-label={ariaLabel}
      className={
        isDarkMode
          ? "border-gray-600 hover:bg-gray-700"
          : "border-purple-300 hover:bg-purple-100"
      }
    >
      {children}
    </Button>
  );
}

function CalendarDayCircle({
  dayData,
  isPast,
  isToday,
}: {
  dayData?: InsightData;
  isPast: boolean;
  isToday: boolean;
}) {
  const showCircle = isPast || isToday;
  const percent = dayData ? dayData.completionRate : 0;

  return (
    <div className="relative w-1/2 h-1/2">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <circle
          className="text-purple-200 dark:text-purple-800"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="18"
          cy="18"
        />
        {showCircle && dayData && (
          <circle
            className="text-purple-600 dark:text-purple-400"
            strokeWidth="4"
            strokeDasharray={16 * 2 * Math.PI}
            strokeDashoffset={16 * 2 * Math.PI * (1 - percent / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="16"
            cx="18"
            cy="18"
          />
        )}
      </svg>
      <div className="absolute inset-0 md:flex items-center justify-center hidden">
        <span className="text-[0.6rem] font-medium text-purple-800 dark:text-purple-200">
          {percent}%
        </span>
      </div>
    </div>
  );
}

export default function ProgressCalendar({
  insightData,
  isDarkMode,
}: ProgressCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { changeMonth, firstDayOfMonth, calendarDays } = useProgressCalendar(
    insightData,
    currentDate,
    setCurrentDate,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <MonthNavButton
          onClick={() => changeMonth(-1)}
          isDarkMode={isDarkMode}
          ariaLabel="Previous Month"
        >
          <ChevronLeft className="h-4 w-4" />
        </MonthNavButton>
        <h3
          className={`text-lg font-semibold ${
            isDarkMode ? "text-purple-200" : "text-purple-800"
          }`}
        >
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <MonthNavButton
          onClick={() => changeMonth(1)}
          isDarkMode={isDarkMode}
          ariaLabel="Next Month"
        >
          <ChevronRight className="h-4 w-4" />
        </MonthNavButton>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center font-bold text-purple-800 dark:text-purple-200 text-xs"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}
        {calendarDays.map(({ dayOfMonth, isPast, isToday, dayData }, index) => (
          <div
            key={index}
            className="aspect-square flex flex-col items-center justify-center p-1"
          >
            <span
              className={`text-xs font-medium mb-1 ${
                isPast || isToday
                  ? "text-purple-800 dark:text-purple-200"
                  : "text-gray-400 dark:text-gray-500"
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
