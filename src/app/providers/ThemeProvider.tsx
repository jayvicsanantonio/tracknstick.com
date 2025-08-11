// Theme provider component managing theme state and persistence
// Applies theme tokens to CSS custom properties and handles mode switching

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from '@app/providers/ThemeContext';
import { ThemeMode, ThemeProviderProps } from '@shared/types/theme';
import { themeConfigs } from '@shared/constants/theme';
import {
  applyThemeTokensToRoot,
  updateThemeClass,
  getInitialTheme,
  setStoredTheme,
  toggleThemeMode,
} from '@shared/utils/theme';

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialTheme());

  const tokens = useMemo(() => themeConfigs[mode], [mode]);

  useEffect(() => {
    applyThemeTokensToRoot(tokens);
    updateThemeClass(mode);
    setStoredTheme(mode);
  }, [mode, tokens]);

  const handleSetMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((current) => toggleThemeMode(current));
  }, []);

  const contextValue = useMemo(
    () => ({
      mode,
      tokens,
      setMode: handleSetMode,
      toggleMode,
    }),
    [mode, tokens, handleSetMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
