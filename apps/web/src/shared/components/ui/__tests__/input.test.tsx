// Covers the shared text field's size: 44px tall on phones, iOS's smallest comfortable tap target.
// From sm up, where a pointer is likely, it is the compact 36px.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@shared/components/ui/input';

describe('Input', () => {
  it('is 44px tall on phones and 36px from sm up', () => {
    render(<Input aria-label="Search habits" type="search" />);

    expect(
      screen.getByRole('searchbox', { name: 'Search habits' }),
    ).toHaveClass('h-11', 'sm:h-9');
  });
});
