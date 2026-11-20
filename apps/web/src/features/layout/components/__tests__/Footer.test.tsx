// Covers the site footer: it links only to pages that exist.
// Placeholder links that go nowhere are worse than no link.

import { describe, it, expect } from 'vitest';
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
