// Toast lifecycle: one exit path, and timers that do not outlive their toast

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useToast } from '../use-toast';

describe('use-toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // toast state is a module-level singleton, so it survives unmount and
    // leaks between tests unless it is drained explicitly.
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
    act(() => {
      vi.runAllTimers();
    });
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
  });

  const drain = () =>
    act(() => {
      vi.runAllTimers();
    });

  it('shows a toast that was just created', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ description: 'saved' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('renders several concurrent toasts rather than dropping them', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ description: 'first' });
      result.current.toast({ description: 'second' });
    });

    const visible = result.current.toasts.filter((t) => t.open);
    expect(visible).toHaveLength(2);
  });

  it('removes a dismissed toast once the delay elapses', () => {
    const { result } = renderHook(() => useToast());

    let handle: { id: string };
    act(() => {
      handle = result.current.toast({ description: 'bye' });
    });

    act(() => {
      result.current.dismiss(handle.id);
    });
    expect(result.current.toasts[0].open).toBe(false);

    drain();
    expect(result.current.toasts).toHaveLength(0);
  });

  it('evicts past the limit through dismissal, not by dropping', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ description: 'a' });
      result.current.toast({ description: 'b' });
      result.current.toast({ description: 'c' });
      result.current.toast({ description: 'd' });
    });

    // The evicted one is closing, not vanished mid-animation
    const closing = result.current.toasts.filter((t) => !t.open);
    expect(closing.length).toBeGreaterThan(0);

    drain();
    expect(result.current.toasts.every((t) => t.open)).toBe(true);
  });

  it('empties state after everything is dismissed', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ description: 'x' });
      result.current.toast({ description: 'y' });
    });

    act(() => {
      result.current.dismiss();
    });
    drain();

    expect(result.current.toasts).toHaveLength(0);
  });
});
