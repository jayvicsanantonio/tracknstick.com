// Covers taking down the launch splash from index.html once the app has something to show.
// It fades out first, then leaves the page, and waits while the app or a page beneath it is still loading.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useHideSplash, useHoldSplash } from '../useHideSplash';

function addSplash() {
  const splash = document.createElement('div');
  splash.id = 'splash';
  document.body.append(splash);
  return splash;
}

/** Lets the splash's own waits run: the end of a render's effects. */
async function settle() {
  await act(() => Promise.resolve());
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

  it('fades the splash out once the app is ready, then removes it', async () => {
    const splash = addSplash();
    const { rerender } = renderHook(({ ready }) => useHideSplash(ready), {
      initialProps: { ready: false },
    });

    rerender({ ready: true });
    await settle();
    expect(splash).toHaveClass('splash-done');
    expect(splash).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(splash).not.toBeInTheDocument();
  });

  it('stays up while a page beneath is loading, and fades once it has loaded', async () => {
    const splash = addSplash();
    const { rerender } = renderHook(
      ({ loading }) => {
        useHideSplash(true);
        useHoldSplash(loading);
      },
      { initialProps: { loading: true } },
    );

    await settle();
    expect(splash).not.toHaveClass('splash-done');

    rerender({ loading: false });
    await settle();
    expect(splash).toHaveClass('splash-done');
  });

  // A page's code arriving swaps its loading state for the page's own, which
  // may still be loading its data: one hold lets go as the next takes over.
  it('stays up when one loading state hands over to the next in a render', async () => {
    const splash = addSplash();
    const { rerender } = renderHook(
      ({ stage }) => {
        useHideSplash(true);
        useHoldSplash(stage === 'code');
        useHoldSplash(stage === 'data');
      },
      { initialProps: { stage: 'code' } },
    );

    rerender({ stage: 'data' });
    await settle();
    expect(splash).not.toHaveClass('splash-done');

    rerender({ stage: 'done' });
    await settle();
    expect(splash).toHaveClass('splash-done');
  });

  // On a connection that gets nowhere, the page's own loading state, with the
  // tab bar beside it, beats a splash that never goes.
  it('stops waiting on a page beneath after four seconds', async () => {
    const splash = addSplash();
    renderHook(() => {
      useHideSplash(true);
      useHoldSplash(true);
    });

    act(() => {
      vi.advanceTimersByTime(3900);
    });
    await settle();
    expect(splash).not.toHaveClass('splash-done');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    await settle();
    expect(splash).toHaveClass('splash-done');
  });

  it('stays up once a page has loaded while the app is still getting ready', async () => {
    const splash = addSplash();
    const { rerender } = renderHook(({ loading }) => useHoldSplash(loading), {
      initialProps: { loading: true },
    });

    rerender({ loading: false });
    await settle();

    expect(splash).not.toHaveClass('splash-done');
  });

  it('does nothing when the page has no splash', async () => {
    const { rerender } = renderHook(
      ({ loading }) => {
        useHideSplash(true);
        useHoldSplash(loading);
      },
      { initialProps: { loading: true } },
    );
    rerender({ loading: false });
    await settle();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }).not.toThrow();
  });
});
