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
    const options: Intl.DateTimeFormatOptions = {
      timeZone,
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }, [date, timeZone]);

  const dayLabel = useMemo(() => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return "Today";
    } else {
      return date.toLocaleDateString("en-US", { timeZone, weekday: "long" });
    }
  }, [date, timeZone]);

  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={handlePreviousDate}
        variant="outline"
        size="icon"
        className={
          isDarkMode
            ? "border-gray-600 text-purple-700 hover:bg-purple-300"
            : "border-purple-200 text-purple-400 hover:bg-purple-100 hover:text-purple-500 shadow"
        }
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div>
        <h2
          className={`text-3xl font-bold ${
            isDarkMode ? "text-purple-200" : "text-purple-800"
          } text-center`}
        >
          {dayLabel}
        </h2>
        <p
          className={`text-center ${
            isDarkMode ? "text-purple-300" : "text-purple-600"
          } mt-2`}
        >
          {formattedDate}
        </p>
      </div>
      <Button
        disabled={new Date().toDateString() === date.toDateString()}
        onClick={handleNextDate}
        variant="outline"
        size="icon"
        className={
          isDarkMode
            ? "border-gray-600 text-purple-700 hover:bg-purple-300"
            : "border-purple-200 text-purple-400 hover:bg-purple-100 hover:text-purple-500 shadow"
        }
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
