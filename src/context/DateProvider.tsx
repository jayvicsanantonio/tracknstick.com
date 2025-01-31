import { ReactNode, useCallback, useMemo, useState } from "react";
import { DateContext } from "@/context/DateContext";

export default function DateProvider({ children }: { children: ReactNode }) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [date, setDate] = useState(new Date());
  const nextDate = useMemo(() => {
    const value = new Date(date);
    value.setDate(value.getDate() + 1);
    return value;
  }, [date]);
  const previousDate = useMemo(() => {
    const value = new Date(date);
    value.setDate(value.getDate() - 1);
    return value;
  }, [date]);

  const handlePreviousDate = useCallback(() => {
    setDate(previousDate);
  }, [previousDate]);

  const handleNextDate = useCallback(() => {
    setDate(nextDate);
  }, [nextDate]);

  return (
    <DateContext.Provider
      value={{
        date,
        setDate,
        handlePreviousDate,
        handleNextDate,
        previousDate,
        nextDate,
        timeZone,
      }}
    >
      {children}
    </DateContext.Provider>
  );
}
