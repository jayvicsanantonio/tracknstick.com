import { useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/context/ThemeContext";
import { DateContext } from "@/context/DateContext";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

export default function DailyHabitDate() {
  const { isDarkMode } = useContext(ThemeContext);
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
        className={`shadow-sm transition-all duration-300 ${
          isDarkMode
            ? "border-purple-900 bg-purple-900/50 hover:bg-purple-800/60 text-purple-300"
            : "border-purple-300 hover:bg-purple-100"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-center relative">
        <h2
          className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? "text-purple-200" : "text-purple-800"
          } mb-1 transition-colors`}
        >
          {dayLabel}
        </h2>
        <p
          className={`text-sm sm:text-base ${
            isDarkMode ? "text-purple-300/80" : "text-purple-600/90"
          } transition-colors`}
        >
          {formattedDate}
        </p>
        <div
          className={`h-0.5 w-24 sm:w-32 mx-auto mt-1.5 rounded-full ${
            isDarkMode
              ? "bg-gradient-to-r from-purple-800/80 via-purple-600/80 to-purple-800/80"
              : "bg-gradient-to-r from-purple-300/60 via-purple-500/60 to-purple-300/60"
          }`}
        ></div>
      </div>
      <Button
        onClick={handleNextDate}
        variant="outline"
        size="icon"
        className={`rounded-full shadow-sm transition-all duration-300 ${
          isDarkMode
            ? "border-gray-700 text-purple-400 bg-gray-800 hover:bg-gray-800 hover:shadow-md hover:text-purple-300 hover:border-purple-500 disabled:cursor-not-allowed"
            : "border-purple-200 text-purple-500 hover:bg-purple-100/50 hover:text-purple-600 hover:border-purple-400 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
