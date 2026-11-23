// Theme configuration constants
// The palettes themselves are declared in src/styles/index.css

export const THEME_STORAGE_KEY = 'track-n-stick-theme';
export const DEFAULT_THEME_PREFERENCE = 'system' as const;

// Hex equivalents of --color-background in src/styles/index.css, used to tint
// the iOS status bar and overscroll chrome via <meta name="theme-color">.
export const THEME_CHROME_COLOR = {
  light: '#fdf2f8',
  dark: '#00140b',
} as const;

// The browser tab's favicon for each theme: the Daily Tracker's completed
// ring in that theme's colours. scripts/generateIcons.mjs draws both, and
// public/applyStoredTheme.js names them again for the first paint.
export const THEME_FAVICON = {
  light: '/icons/favicon-light.svg',
  dark: '/icons/favicon-dark.svg',
} as const;
