// Type definitions for the theme system
// Defines resolved theme modes, stored user preferences (including system), and context interfaces

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

export interface ThemeContextValue {
  /** Resolved active colour scheme ('light' or 'dark'). */
  mode: ThemeMode;
  /** User's chosen setting ('system', 'light', or 'dark'). */
  preference: ThemePreference;
  /** Sets the preference to 'system', 'light', or 'dark'. */
  setMode: (mode: ThemePreference) => void;
  /** Flips the currently active resolved mode between 'light' and 'dark'. */
  toggleMode: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}
