// Type definitions for the theme system
// Defines the appearance shown, the user's preference, and the context interface

/** The appearance shown: which palette is on screen. */
export type ThemeMode = 'light' | 'dark';

/** What the user asked for: the system's appearance, or one of their own. */
export type ThemePreference = 'system' | ThemeMode;

export interface ThemeContextValue {
  /** The appearance shown, following the system unless one was chosen. */
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Steps System → Light → Dark → System, for a single menu item. */
  cyclePreference: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}
