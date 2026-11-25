// Theme utility functions for CSS class toggling, system appearance resolution,
// persistence, and syncing iOS status-bar chrome (<meta name="theme-color"> & color-scheme) and the favicon.

import { ThemeMode, ThemePreference } from '@shared/types/theme';
import {
  THEME_STORAGE_KEY,
  DEFAULT_THEME_PREFERENCE,
  THEME_CHROME_COLOR,
  THEME_FAVICON,
} from '@shared/constants/theme';

export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function resolveThemeMode(preference: ThemePreference): ThemeMode {
  return preference === 'system' ? getSystemTheme() : preference;
}

export function updateThemeClass(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
  root.style.colorScheme = mode;

  // The theme's own theme-color, not the launch splash's.
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]:not(#splash-theme-color)',
  );
  if (meta) {
    meta.content = THEME_CHROME_COLOR[mode];
  }

  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) {
    favicon.setAttribute('href', THEME_FAVICON[mode]);
  }
}

function getStoredThemePreference(): ThemePreference | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : null;
  } catch {
    return null;
  }
}

export function setStoredTheme(preference: ThemePreference): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Silently handle storage errors
  }
}

export function getInitialThemePreference(): ThemePreference {
  return getStoredThemePreference() ?? DEFAULT_THEME_PREFERENCE;
}

export function toggleThemeMode(currentMode: ThemeMode): ThemeMode {
  return currentMode === 'light' ? 'dark' : 'light';
}
