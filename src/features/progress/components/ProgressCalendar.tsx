import { useState } from "react";
import { useProgressCalendar } from "@/features/progress/hooks/useProgressCalendar";
import MonthNavButton from "@/features/progress/components/MonthNavButton";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { InsightData } from "@/features/progress/types/InsightData";
import CalendarDayCircle from "@/features/progress/components/CalendarDayCircle";

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProgressCalendar({
  insightData,
  isDarkMode,
}: {
  insightData: InsightData[];
  isDarkMode: boolean;
}) {
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
