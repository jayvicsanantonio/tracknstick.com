// Theme configuration constants
// The palettes themselves are declared in src/styles/index.css

/** Where a chosen appearance is kept; absent, the app follows the system. */
export const THEME_STORAGE_KEY = 'track-n-stick-appearance';

/**
 * Where the app used to save its mode, on every load, defaulting to dark. A
 * value there says nothing about what the user wanted, so it is removed.
 */
export const LEGACY_THEME_STORAGE_KEY = 'track-n-stick-theme';

/** The media query for the system's dark appearance. */
export const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';
