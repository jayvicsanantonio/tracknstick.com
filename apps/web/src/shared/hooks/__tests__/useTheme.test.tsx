// Unit tests for the useTheme hook: the app follows the system's light or dark appearance by default.
// A chosen appearance overrides the system and is remembered; the palette is set by the root class.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';

import ThemeProvider from '@app/providers/ThemeProvider';
import { useTheme } from '@shared/hooks/useTheme';
import {
  LEGACY_THEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from '@shared/constants/theme';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const realMatchMedia = window.matchMedia;
const root = document.documentElement;

/** Sets the system's appearance, and returns a way to change it later. */
function systemAppearance(initial: 'light' | 'dark') {
  let dark = initial === 'dark';
  const listeners = new Set<() => void>();
  window.matchMedia = vi.fn(
    (query: string) =>
      ({
        ...realMatchMedia(query),
        get matches() {
          return query === '(prefers-color-scheme: dark)' && dark;
        },
        addEventListener: (_: string, listener: () => void) => {
          listeners.add(listener);
        },
        removeEventListener: (_: string, listener: () => void) => {
          listeners.delete(listener);
        },
      }) as unknown as MediaQueryList,
  );
  return (next: 'light' | 'dark') => {
    dark = next === 'dark';
    listeners.forEach((listener) => listener());
  };
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = realMatchMedia;
    root.classList.remove('light', 'dark');
  });

  it('follows the system appearance by default', () => {
    systemAppearance('dark');
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.preference).toBe('system');
    expect(result.current.mode).toBe('dark');
    expect(root).toHaveClass('dark');
  });

  it('changes with the system while following it', () => {
    const setSystem = systemAppearance('light');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('light');

    act(() => setSystem('dark'));

    expect(result.current.mode).toBe('dark');
    expect(root).toHaveClass('dark');
    expect(root).not.toHaveClass('light');
  });

  it('keeps a chosen appearance over the system, and remembers it', () => {
    systemAppearance('dark');
    const { result, unmount } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.setPreference('light'));
    expect(result.current.mode).toBe('light');
    unmount();

    const { result: next } = renderHook(() => useTheme(), { wrapper });
    expect(next.current.preference).toBe('light');
    expect(root).toHaveClass('light');
  });

  it('steps through System, Light and Dark, back to System', () => {
    systemAppearance('light');
    const { result } = renderHook(() => useTheme(), { wrapper });

    const seen = [result.current.preference];
    for (let i = 0; i < 3; i += 1) {
      act(() => result.current.cyclePreference());
      seen.push(result.current.preference);
    }

    expect(seen).toEqual(['system', 'light', 'dark', 'system']);
  });

  it('ignores the mode the app used to save on every load, so it follows the system', () => {
    systemAppearance('light');
    localStorage.setItem(LEGACY_THEME_STORAGE_KEY, 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.preference).toBe('system');
    expect(result.current.mode).toBe('light');
    expect(localStorage.getItem(LEGACY_THEME_STORAGE_KEY)).toBeNull();
  });

  it('saves nothing until an appearance is chosen', () => {
    systemAppearance('dark');
    renderHook(() => useTheme(), { wrapper });

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});
