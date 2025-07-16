import { useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DateContext } from "@/context/DateContext";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

export default function DailyHabitDate() {
  const { date, handlePreviousDate, handleNextDate, timeZone } =
    useContext(DateContext);

  const formattedDate = useMemo(() => {
    return date.toLocaleDateString("en-US", {
      timeZone,
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date, timeZone]);

  const dayLabel = useMemo(() => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return "Today";
    } else {
      return date.toLocaleDateString("en-US", {
        timeZone,
        weekday: "long",
      });
    }
  }, [date, timeZone]);

  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={handlePreviousDate}
        variant="outline"
        size="icon"
        aria-label="Previous Date"
        className="shadow-sm transition-all duration-300 border-purple-300 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-900/50 dark:hover:bg-purple-800/60 dark:text-purple-300"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </Button>
      <div className="text-center relative">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 dark:text-purple-200 mb-1 transition-colors">
          {dayLabel}
        </h2>
        <p className="text-sm sm:text-base text-purple-600/90 dark:text-purple-300/80 transition-colors">
          {formattedDate}
        </p>
        <div className="h-0.5 w-24 sm:w-32 mx-auto mt-1.5 rounded-full bg-gradient-to-r from-purple-300/60 via-purple-500/60 to-purple-300/60 dark:from-purple-800/80 dark:via-purple-600/80 dark:to-purple-800/80"></div>
      </div>
      <Button
        onClick={handleNextDate}
        variant="outline"
        size="icon"
        aria-label="Next Date"
        className="rounded-full shadow-sm transition-all duration-300 border-purple-200 text-purple-500 hover:bg-purple-100/50 hover:text-purple-600 hover:border-purple-400 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-purple-400 dark:bg-gray-800 dark:hover:bg-gray-800 dark:hover:shadow-md dark:hover:text-purple-300 dark:hover:border-purple-500 dark:disabled:cursor-not-allowed"
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>
    </div>
  );
}
