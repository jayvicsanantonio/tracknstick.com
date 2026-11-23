// Covers taking down the launch splash from index.html once the app has something to show.
// It fades out first, then leaves the page, and waits while the app is still getting ready.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useHideSplash } from '../useHideSplash';

function addSplash() {
  const splash = document.createElement('div');
  splash.id = 'splash';
  document.body.append(splash);
  return splash;
}

describe('useHideSplash', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.getElementById('splash')?.remove();
    vi.useRealTimers();
  });

  it('leaves the splash up while the app is getting ready', () => {
    const splash = addSplash();
    renderHook(() => useHideSplash(false));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(splash).toBeInTheDocument();
    expect(splash).not.toHaveClass('splash-done');
  });

  it('fades the splash out once the app is ready, then removes it', () => {
    const splash = addSplash();
    const { rerender } = renderHook(({ ready }) => useHideSplash(ready), {
      initialProps: { ready: false },
    });

    rerender({ ready: true });
    expect(splash).toHaveClass('splash-done');
    expect(splash).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(splash).not.toBeInTheDocument();
  });

  it('does nothing when the page has no splash', () => {
    expect(() => {
      renderHook(() => useHideSplash(true));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }).not.toThrow();
  });
});
