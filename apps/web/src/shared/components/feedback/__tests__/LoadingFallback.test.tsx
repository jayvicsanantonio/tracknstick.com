// Covers the loading state shown while a page's code downloads: the app icon's medallion, small.
// It tells assistive technology the page is loading, holds the launch splash up, and holds still for reduced motion.

import { describe, it, expect, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useHideSplash } from '@shared/hooks/useHideSplash';
import LoadingFallback from '../LoadingFallback';

/** The app, ready: it would take the launch splash down now. */
function AppReady() {
  useHideSplash(true);
  return null;
}

describe('LoadingFallback', () => {
  afterEach(() => {
    document.getElementById('splash')?.remove();
  });

  // The launch splash fades straight onto the first page, never onto this.
  it("keeps the launch splash up while a page's code downloads", async () => {
    const splash = document.createElement('div');
    splash.id = 'splash';
    document.body.append(splash);

    const { rerender } = render(
      <>
        <AppReady />
        <LoadingFallback />
      </>,
    );
    await act(() => Promise.resolve());
    expect(splash).not.toHaveClass('splash-done');

    rerender(<AppReady />);
    await act(() => Promise.resolve());
    expect(splash).toHaveClass('splash-done');
  });

  it('tells assistive technology the page is loading', () => {
    render(<LoadingFallback />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it("draws the medallion: a dial, the ring's track, a moving arc and the check", () => {
    const { container } = render(<LoadingFallback />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    // The dial and the ring's track.
    expect(svg?.querySelectorAll('circle')).toHaveLength(2);
    // The arc, a short dash of the ring, and the check.
    expect(svg?.querySelector('.animate-spin')).toHaveAttribute(
      'stroke-dasharray',
      '28 72',
    );
    expect(svg?.querySelector('path:not(.animate-spin)')).toHaveAttribute(
      'd',
      'M10 34L25 49L54 17',
    );
  });

  it('stops the arc for people who ask for reduced motion', () => {
    const { container } = render(<LoadingFallback />);

    expect(container.querySelector('.animate-spin')).toHaveClass(
      'motion-reduce:animate-none',
    );
  });
});
