// Type definitions for the theme system
// Defines theme modes, configuration, and context interfaces

export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  brandPrimary: string;
  brandSecondary: string;
  brandTertiary: string;
  brandLight: string;
  brandLighter: string;
  brandText: string;
  brandTextLight: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  borderPrimary: string;
  borderSecondary: string;
  borderBrand: string;
  hoverSurface: string;
  hoverBrand: string;
  activeSurface: string;
  activeBrand: string;
  error: string;
  errorLight: string;
  errorText: string;
  success: string;
  successLight: string;
  successText: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  tokens: ThemeTokens;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  tokens: ThemeTokens;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}
