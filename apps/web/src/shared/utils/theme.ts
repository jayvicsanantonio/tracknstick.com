// Theme utility functions for CSS custom properties and persistence
// Handles theme token application and storage management

import { ThemeMode } from '@shared/types/theme';
import { THEME_STORAGE_KEY, DEFAULT_THEME_MODE } from '@shared/constants/theme';

export function updateThemeClass(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
}

function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Silently handle storage errors
  }
}

export function getInitialTheme(): ThemeMode {
  const stored = getStoredTheme();
  return stored ?? DEFAULT_THEME_MODE;
}

export function toggleThemeMode(currentMode: ThemeMode): ThemeMode {
  return currentMode === 'light' ? 'dark' : 'light';
}
