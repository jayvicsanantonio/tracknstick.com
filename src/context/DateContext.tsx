import { createContext } from "react";

interface DateContextProps {
  date: Date;
  setDate: (date: Date) => void;
  handlePreviousDate: () => void;
  handleNextDate: () => void;
  previousDate: Date;
  nextDate: Date;
  timeZone: string;
  currentDate: Date;
}

export const DateContext = createContext<DateContextProps>({
  date: new Date(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDate: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handlePreviousDate: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleNextDate: () => {},
  previousDate: new Date(),
  nextDate: new Date(),
  timeZone: "America/Los_Angeles",
  currentDate: new Date(),
});
