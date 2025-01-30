import { createContext } from "react";

interface DateContextProps {
  date: Date;
  setDate: (date: Date) => void;
  handlePreviousDate: () => void;
  handleNextDate: () => void;
  timeZone: string;
}

export const DateContext = createContext<DateContextProps>({
  date: new Date(),
  setDate: () => {},
  handlePreviousDate: () => {},
  handleNextDate: () => {},
  timeZone: "America/Los_Angeles",
});
