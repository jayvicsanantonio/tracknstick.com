// Covers the page's large title: the page's heading, drawn large on phones as iOS draws one.
// On wider screens the header's navigation names the page, and the heading stays for screen readers.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LargeTitle from '@shared/components/layouts/LargeTitle';

describe('LargeTitle', () => {
  it("is the page's heading", () => {
    render(<LargeTitle>Habits</LargeTitle>);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Habits' }),
    ).toBeInTheDocument();
  });

  it('is drawn large in the title typeface on phones, and only read out from sm up', () => {
    render(<LargeTitle>Habits</LargeTitle>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-display', 'text-[34px]', 'sm:sr-only');
  });
});
