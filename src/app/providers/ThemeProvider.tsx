// Theme provider component managing theme mode and persistence
// The palettes themselves live in CSS; this only selects between them

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from '@app/providers/ThemeContext';
import { ThemeMode, ThemeProviderProps } from '@shared/types/theme';
import {
  updateThemeClass,
  getInitialTheme,
  setStoredTheme,
  toggleThemeMode,
} from '@shared/utils/theme';

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    updateThemeClass(mode);
    setStoredTheme(mode);
  }, [mode]);

  const handleSetMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((current) => toggleThemeMode(current));
  }, []);

  const contextValue = useMemo(
    () => ({
      mode,
      setMode: handleSetMode,
      toggleMode,
    }),
    [mode, handleSetMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
