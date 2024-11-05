import { useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/context/ThemeContext";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

export default function DailyHabitDate() {
  const { isDarkMode } = useContext(ThemeContext);
  const [currentDate, setCurrentDate] = useState(new Date());

  const formattedDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return currentDate.toLocaleDateString("en-US", options);
  }, [currentDate]);

  const dayLabel = useMemo(() => {
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    if (isToday) {
      return "Today";
    } else {
      return currentDate.toLocaleDateString("en-US", { weekday: "long" });
    }
  }, [currentDate]);

  const changeDay = (increment: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + increment);
      return newDate;
    });
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        onClick={() => changeDay(-1)}
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
        onClick={() => changeDay(1)}
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
