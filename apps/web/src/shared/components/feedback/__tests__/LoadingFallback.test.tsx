// Covers the loading state shown while a page's code downloads: the splash medallion, small.
// It tells assistive technology the page is loading, and holds still for reduced motion.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingFallback from '../LoadingFallback';

describe('LoadingFallback', () => {
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
