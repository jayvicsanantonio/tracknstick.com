// Unit tests for the useTheme hook
// Tests system-default resolution, explicit mode switching, toggling, and DOM class/meta sync.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';

import ThemeProvider from '@app/providers/ThemeProvider';
import { useTheme } from '@shared/hooks/useTheme';
import { THEME_CHROME_COLOR, THEME_FAVICON } from '@shared/constants/theme';

interface WrapperProps {
  children: ReactNode;
}

const wrapper = ({ children }: WrapperProps) => (
  <ThemeProvider>{children}</ThemeProvider>
);

function mockSystemDark(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    document.querySelector('meta[name="theme-color"]')?.remove();
    document.querySelector('link[rel="icon"]')?.remove();
    vi.restoreAllMocks();
  });

  it('defaults new users to system preference and resolves OS colour scheme', () => {
    mockSystemDark(true);
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.preference).toBe('system');
    expect(result.current.mode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('resolves system preference to light when OS prefers light', () => {
    mockSystemDark(false);
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.preference).toBe('system');
    expect(result.current.mode).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('can toggle theme mode between light and dark', () => {
    mockSystemDark(true);
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleMode();
    });

    expect(result.current.mode).toBe('light');
    expect(result.current.preference).toBe('light');

    act(() => {
      result.current.toggleMode();
    });

    expect(result.current.mode).toBe('dark');
    expect(result.current.preference).toBe('dark');
  });

  it('can set theme preference directly including system', () => {
    mockSystemDark(true);
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setMode('light');
    });
    expect(result.current.mode).toBe('light');
    expect(result.current.preference).toBe('light');

    act(() => {
      result.current.setMode('system');
    });
    expect(result.current.preference).toBe('system');
    expect(result.current.mode).toBe('dark');
  });

  it('drives the palette through the root class and syncs theme-color meta', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
    mockSystemDark(true);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(meta.content).toBe(THEME_CHROME_COLOR.dark);

    act(() => {
      result.current.setMode('light');
    });

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(meta.content).toBe(THEME_CHROME_COLOR.light);
  });

  it('swaps the browser tab favicon to match the theme', () => {
    const icon = document.createElement('link');
    icon.rel = 'icon';
    document.head.append(icon);
    mockSystemDark(true);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(icon.getAttribute('href')).toBe(THEME_FAVICON.dark);

    act(() => {
      result.current.setMode('light');
    });

    expect(icon.getAttribute('href')).toBe(THEME_FAVICON.light);
  });
});
