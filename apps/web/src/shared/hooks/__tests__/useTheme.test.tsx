// Unit tests for the useTheme hook
// Tests theme functionality and state management

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';

import ThemeProvider from '@app/providers/ThemeProvider';
import { useTheme } from '@shared/hooks/useTheme';

interface WrapperProps {
  children: ReactNode;
}

const wrapper = ({ children }: WrapperProps) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to dark theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('can toggle theme mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleMode();
    });

    expect(result.current.mode).toBe('light');

    act(() => {
      result.current.toggleMode();
    });

    expect(result.current.mode).toBe('dark');
  });

  it('can set theme mode directly', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setMode('light');
    });

    expect(result.current.mode).toBe('light');

    act(() => {
      result.current.setMode('dark');
    });

    expect(result.current.mode).toBe('dark');
  });

  it('drives the palette through the root class, not inline styles', () => {
    // The palettes live in CSS keyed on :root and .dark, so the only thing
    // the provider has to get right is which class is on the element.
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);

    act(() => {
      result.current.setMode('light');
    });

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
