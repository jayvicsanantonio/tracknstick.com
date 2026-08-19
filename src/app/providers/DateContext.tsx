import { createContext } from 'react';

export interface DateContextProps {
  date: Date;
  setDate: (date: Date) => void;
  handlePreviousDate: () => void;
  handleNextDate: () => void;
  timeZone: string;
  currentDate: Date;
}

/**
 * Undefined by default so useDate() can fail loudly outside the provider,
 * matching ThemeContext.
 *
 * The previous default supplied a working-looking fake -- no-op setters and a
 * hardcoded timeZone of 'America/Los_Angeles' -- so a component rendered
 * outside the provider silently computed every date in the wrong zone rather
 * than failing. In an app whose correctness is entirely timezone-dependent
 * that is the worst possible default.
 */
export const DateContext = createContext<DateContextProps | undefined>(
  undefined,
);
