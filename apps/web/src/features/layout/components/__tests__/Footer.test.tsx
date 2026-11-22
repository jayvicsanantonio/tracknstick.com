// Covers the site footer: it links only to pages that exist, and stays out of the installed app.
// Placeholder links that go nowhere are worse than no link; a copyright line is a website's, not an app's.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/features/layout/components/Footer';

describe('Footer', () => {
  it('shows the copyright line', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toHaveTextContent("Track N' Stick");
  });

  it('has no links that go nowhere', () => {
    render(<Footer />);

    for (const link of screen.queryAllByRole('link')) {
      expect(link).not.toHaveAttribute('href', '#');
    }
  });
});

describe('Footer in the app installed on the home screen', () => {
  const realMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = realMatchMedia;
    Reflect.deleteProperty(navigator, 'standalone');
  });

  it('is left out, as a native app has no footer', () => {
    window.matchMedia = vi.fn((query: string) => ({
      ...realMatchMedia(query),
      matches: query === '(display-mode: standalone)',
    }));

    render(<Footer />);

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('is left out where iOS reports a home-screen app its older way', () => {
    Object.defineProperty(navigator, 'standalone', {
      configurable: true,
      value: true,
    });

    render(<Footer />);

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});
