import { createContext, ReactNode, useCallback, useMemo, useState } from "react";

interface AppContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  date: Date;
  setDate: (date: Date) => void;
  handlePreviousDate: () => void;
  handleNextDate: () => void;
  previousDate: Date;
  nextDate: Date;
  timeZone: string;
}

export const AppContext = createContext<AppContextProps>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  date: new Date(),
  setDate: () => {},
  handlePreviousDate: () => {},
  handleNextDate: () => {},
  previousDate: new Date(),
  nextDate: new Date(),
  timeZone: "America/Los_Angeles",
});

export default function AppProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [date, setDate] = useState(new Date());
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

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

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
      date,
      setDate,
      handlePreviousDate,
      handleNextDate,
      previousDate,
      nextDate,
      timeZone,
    }),
    [
      isDarkMode,
      toggleDarkMode,
      date,
      handlePreviousDate,
      handleNextDate,
      previousDate,
      nextDate,
      timeZone,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}