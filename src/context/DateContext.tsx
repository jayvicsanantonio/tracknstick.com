import { createContext } from "react";

interface DateContextProps {
  date: Date;
  setDate: (date: Date) => void;
  handlePreviousDate: () => void;
  handleNextDate: () => void;
}

export const DateContext = createContext<DateContextProps>({
  date: new Date(),
  setDate: () => {},
  handlePreviousDate: () => {},
  handleNextDate: () => {},
});
