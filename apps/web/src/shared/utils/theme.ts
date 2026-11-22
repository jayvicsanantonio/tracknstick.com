// Theme utility functions: the root class, the stored preference and the system's appearance
// The palettes live in CSS; these only choose between them

import { ThemeMode, ThemePreference } from '@shared/types/theme';
import {
  LEGACY_THEME_STORAGE_KEY,
  SYSTEM_DARK_QUERY,
  THEME_STORAGE_KEY,
} from '@shared/constants/theme';

export function updateThemeClass(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
}

/** The system's appearance right now. */
export function systemTheme(): ThemeMode {
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';
}

/** The chosen appearance, or 'system' when none was chosen. */
export function getStoredPreference(): ThemePreference {
  try {
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** Remembers a chosen appearance; following the system stores nothing. */
export function setStoredPreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Storage unavailable: the choice lasts until the page closes.
  }
}

/** The next preference in the order System → Light → Dark → System. */
export function nextPreference(current: ThemePreference): ThemePreference {
  if (current === 'system') return 'light';
  if (current === 'light') return 'dark';
  return 'system';
}
