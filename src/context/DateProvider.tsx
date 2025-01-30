import { ReactNode, useCallback, useState } from "react";
import { DateContext } from "@/context/DateContext";

export default function DateProvider({ children }: { children: ReactNode }) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [date, setDate] = useState(new Date());
  const handlePreviousDate = useCallback(() => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const handleNextDate = useCallback(() => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);

  return (
    <DateContext.Provider
      value={{ date, setDate, handlePreviousDate, handleNextDate, timeZone }}
    >
      {children}
    </DateContext.Provider>
  );
}
