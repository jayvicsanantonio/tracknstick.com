// Theme provider component managing theme preference (system/light/dark),
// live OS appearance tracking, and CSS class + iOS status bar synchronization.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from '@app/providers/ThemeContext';
import {
  ThemeMode,
  ThemePreference,
  ThemeProviderProps,
} from '@shared/types/theme';
import {
  getInitialThemePreference,
  getSystemTheme,
  resolveThemeMode,
  setStoredTheme,
  toggleThemeMode,
  updateThemeClass,
} from '@shared/utils/theme';

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    getInitialThemePreference(),
  );
  const [systemMode, setSystemMode] = useState<ThemeMode>(() =>
    getSystemTheme(),
  );

  const mode: ThemeMode =
    preference === 'system' ? systemMode : resolveThemeMode(preference);

  useEffect(() => {
    updateThemeClass(mode);
  }, [mode]);

  useEffect(() => {
    setStoredTheme(preference);
  }, [preference]);

  // Stay in sync when iOS switches Light/Dark automatically on schedule.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const handleSetMode = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  const toggleMode = useCallback(() => {
    setPreference((current) => {
      const active =
        current === 'system' ? getSystemTheme() : resolveThemeMode(current);
      return toggleThemeMode(active);
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      mode,
      preference,
      setMode: handleSetMode,
      toggleMode,
    }),
    [mode, preference, handleSetMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
