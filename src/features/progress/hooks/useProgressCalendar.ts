import { useMemo } from "react";

export interface InsightData {
  date: string;
  completionRate: number;
}

export interface CalendarDay {
  dayOfMonth: number;
  isPast: boolean;
  isToday: boolean;
  date: Date;
  dayData?: InsightData;
}

export function useProgressCalendar(
  insightData: InsightData[],
  currentDate: Date,
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>,
) {
  const changeMonth = (increment: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays: CalendarDay[] = useMemo(() => {
    const today = new Date();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayOfMonth = i + 1;
      const date = new Date(year, month, dayOfMonth);
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();
      const dayData = insightData.find(
        (d) => parseInt(d.date.split("-")[2]) === dayOfMonth,
      );
      return { dayOfMonth, isPast, isToday, date, dayData };
    });
  }, [daysInMonth, year, month, insightData]);

  return {
    changeMonth,
    firstDayOfMonth,
    calendarDays,
  };
}
