// Covers taking down the launch splash from index.html once the app has something to show.
// It fades out first, then leaves the page, and waits while the app or a page beneath it is still loading.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  isSplashVisible,
  useHideSplash,
  useHoldSplash,
} from '../useHideSplash';

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

  it("hands the system's chrome back to the theme as the splash fades", async () => {
    addSplash();
    const splashColour = document.createElement('meta');
    splashColour.name = 'theme-color';
    splashColour.id = 'splash-theme-color';
    document.head.append(splashColour);
    const { rerender } = renderHook(({ ready }) => useHideSplash(ready), {
      initialProps: { ready: false },
    });

    await settle();
    expect(splashColour).toBeInTheDocument();

    rerender({ ready: true });
    await settle();
    expect(splashColour).not.toBeInTheDocument();
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

  it('lets a visible splash paint two frames before starting the exit transition', async () => {
    const splash = addSplash();
    vi.spyOn(splash, 'getBoundingClientRect').mockReturnValue({
      width: 390,
      height: 844,
      top: 0,
      left: 0,
      right: 390,
      bottom: 844,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const frames: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.push(callback);
        return frames.length;
      });

    try {
      renderHook(() => useHideSplash(true));
      await settle();

      expect(splash).not.toHaveClass('splash-done');
      expect(frames).toHaveLength(1);

      act(() => {
        frames.shift()?.(16);
      });
      expect(splash).not.toHaveClass('splash-done');
      expect(frames).toHaveLength(1);

      act(() => {
        frames.shift()?.(32);
      });
      expect(splash).toHaveClass('splash-done');
    } finally {
      rafSpy.mockRestore();
    }
  });

  it('keeps waiting if a hold takes over between paint frames', async () => {
    const splash = addSplash();
    vi.spyOn(splash, 'getBoundingClientRect').mockReturnValue({
      width: 390,
      height: 844,
      top: 0,
      left: 0,
      right: 390,
      bottom: 844,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const frames: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.push(callback);
        return frames.length;
      });

    try {
      const { rerender } = renderHook(
        ({ loading }) => {
          useHideSplash(true);
          useHoldSplash(loading);
        },
        { initialProps: { loading: false } },
      );
      await settle();
      expect(frames).toHaveLength(1);

      // A new loading state mounts before the second paint frame arrives.
      rerender({ loading: true });
      act(() => {
        frames.shift()?.(16);
      });
      act(() => {
        frames.shift()?.(32);
      });
      expect(splash).not.toHaveClass('splash-done');
    } finally {
      rafSpy.mockRestore();
    }
  });

  it('reports when the launch splash is visibly showing on a home screen app', () => {
    const matchSpy = vi
      .spyOn(window, 'matchMedia')
      .mockImplementation((query: string) => ({
        matches: query === '(display-mode: standalone) and (pointer: coarse)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

    try {
      expect(isSplashVisible()).toBe(false);

      const splash = addSplash();
      expect(isSplashVisible()).toBe(true);

      splash.classList.add('splash-done');
      expect(isSplashVisible()).toBe(false);
    } finally {
      matchSpy.mockRestore();
    }
  });
});
