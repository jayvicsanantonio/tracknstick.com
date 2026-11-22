// Theme provider: follows the system's light or dark appearance unless the user chose one
// The palettes themselves live in CSS; this only selects between them

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from '@app/providers/ThemeContext';
import {
  ThemeMode,
  ThemePreference,
  ThemeProviderProps,
} from '@shared/types/theme';
import { SYSTEM_DARK_QUERY } from '@shared/constants/theme';
import {
  getStoredPreference,
  nextPreference,
  setStoredPreference,
  systemTheme,
  updateThemeClass,
} from '@shared/utils/theme';

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    getStoredPreference(),
  );
  const [system, setSystem] = useState<ThemeMode>(() => systemTheme());

  // Follows the system as it changes, such as at sunset on Automatic.
  useEffect(() => {
    const query = window.matchMedia(SYSTEM_DARK_QUERY);
    const onChange = () => setSystem(systemTheme());
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const mode = preference === 'system' ? system : preference;

  useEffect(() => {
    updateThemeClass(mode);
  }, [mode]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    setStoredPreference(next);
  }, []);

  const cyclePreference = useCallback(() => {
    setPreferenceState((current) => {
      const next = nextPreference(current);
      setStoredPreference(next);
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ mode, preference, setPreference, cyclePreference }),
    [mode, preference, setPreference, cyclePreference],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
