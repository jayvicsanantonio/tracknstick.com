// Covers which text is set in the brand's typeface: card and dialog titles, as headings, while text and controls use the system's.
// Plus Jakarta Sans gives titles the brand's voice; San Francisco keeps the rest native.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardTitle } from '@shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog';

describe('titles', () => {
  it("sets a card's title in the brand's typeface", () => {
    render(<CardTitle>Habits Overview</CardTitle>);

    expect(screen.getByText('Habits Overview')).toHaveClass('font-display');
  });

  it("sets a dialog's title in the brand's typeface", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>Add a new habit to your list.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole('heading', { name: 'Add New Habit' })).toHaveClass(
      'font-display',
    );
  });
});
