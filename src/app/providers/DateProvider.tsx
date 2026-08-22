import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { DateContext } from '@app/providers/DateContext';

/** Milliseconds until the next local midnight. */
function msUntilNextMidnight(from: Date): number {
  const next = new Date(from);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - from.getTime();
}

export default function DateProvider({ children }: { children: ReactNode }) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [date, setDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  // Roll "today" over at midnight rather than on a fixed hourly tick, which
  // could leave the app believing it was still yesterday for up to 59 minutes
  // after the date changed.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const scheduleRollover = () => {
      timer = setTimeout(() => {
        setCurrentDate(new Date());
        scheduleRollover();
      }, msUntilNextMidnight(new Date()));
    };

    scheduleRollover();
    return () => clearTimeout(timer);
  }, []);

  const handlePreviousDate = useCallback(() => {
    setDate((previous) => {
      const value = new Date(previous);
      value.setDate(value.getDate() - 1);
      return value;
    });
  }, []);

  const handleNextDate = useCallback(() => {
    setDate((previous) => {
      const value = new Date(previous);
      value.setDate(value.getDate() + 1);
      return value;
    });
  }, []);

  const value = useMemo(
    () => ({
      date,
      setDate,
      handlePreviousDate,
      handleNextDate,
      timeZone,
      currentDate,
    }),
    [date, handlePreviousDate, handleNextDate, timeZone, currentDate],
  );

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
}
