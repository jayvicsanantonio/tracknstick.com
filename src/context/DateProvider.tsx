import { ReactNode, useState } from "react";
import { DateContext } from "@/context/DateContext";

export default function DateProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState(new Date());
  const handlePreviousDate = () => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };
  const handleNextDate = () => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  return (
    <DateContext.Provider
      value={{ date, setDate, handlePreviousDate, handleNextDate }}
    >
      {children}
    </DateContext.Provider>
  );
}
