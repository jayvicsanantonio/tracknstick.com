// Type definitions for the theme system
// Defines theme modes, configuration, and context interfaces

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}
