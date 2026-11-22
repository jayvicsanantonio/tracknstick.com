// User sensory preferences (haptics & sound effects), persisted to localStorage
// and synchronized across the Settings sheet and interaction utilities.

import { useCallback, useEffect, useState } from 'react';

const PREFS_STORAGE_KEY = 'track-n-stick-preferences';

export interface UserPreferences {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  hapticsEnabled: true,
  soundEnabled: true,
};

const listeners = new Set<() => void>();

function readStoredPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      hapticsEnabled:
        typeof parsed.hapticsEnabled === 'boolean'
          ? parsed.hapticsEnabled
          : DEFAULT_PREFERENCES.hapticsEnabled,
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean'
          ? parsed.soundEnabled
          : DEFAULT_PREFERENCES.soundEnabled,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

let cachedPreferences: UserPreferences = readStoredPreferences();

export function getPreferences(): UserPreferences {
  return cachedPreferences;
}

function updatePreferences(patch: Partial<UserPreferences>): void {
  cachedPreferences = { ...cachedPreferences, ...patch };
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(cachedPreferences));
  } catch {
    // Ignore storage quota or private browsing errors
  }
  listeners.forEach((listener) => listener());
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    getPreferences(),
  );

  useEffect(() => {
    const handleChange = () => setPreferences(getPreferences());
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const setHapticsEnabled = useCallback((enabled: boolean) => {
    updatePreferences({ hapticsEnabled: enabled });
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    updatePreferences({ soundEnabled: enabled });
  }, []);

  return {
    ...preferences,
    setHapticsEnabled,
    setSoundEnabled,
  };
}
