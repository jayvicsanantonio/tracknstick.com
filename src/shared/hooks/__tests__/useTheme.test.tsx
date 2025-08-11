// Unit tests for the useTheme hook
// Tests theme functionality and state management

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';

// Unmock for this specific test file
vi.unmock('@app/providers/ThemeProvider');
vi.unmock('@shared/hooks/useTheme');

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
    expect(result.current.tokens).toBeDefined();
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

  it('provides correct tokens for each theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Dark theme tokens
    expect(result.current.mode).toBe('dark');
    expect(result.current.tokens.background).toContain('hsl(155');

    act(() => {
      result.current.setMode('light');
    });

    // Light theme tokens
    expect(result.current.tokens.background).toContain('hsl(327');
  });
});
