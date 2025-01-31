import { createContext } from "react";

interface DateContextProps {
  date: Date;
  setDate: (date: Date) => void;
  handlePreviousDate: () => void;
  handleNextDate: () => void;
  previousDate: Date;
  nextDate: Date;
  timeZone: string;
}

export const DateContext = createContext<DateContextProps>({
  date: new Date(),
  setDate: () => {},
  handlePreviousDate: () => {},
  handleNextDate: () => {},
  previousDate: new Date(),
  nextDate: new Date(),
  timeZone: "America/Los_Angeles",
});
