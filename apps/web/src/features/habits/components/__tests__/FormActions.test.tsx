// Covers the habit form's submit button label, which says what the dialog will do.
// Adding a habit reads "Add habit"; editing one keeps "Save Changes".

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog } from '@shared/components/ui/dialog';
import FormActions from '../FormActions';
import type { Habit } from '@/features/habits/types/Habit';

function renderActions(habit?: Habit, isSubmitting = false) {
  render(
    <Dialog open>
      <FormActions isSubmitting={isSubmitting} habit={habit} />
    </Dialog>,
  );
}

const existing = {
  id: '1',
  name: 'Read',
  icon: 'BookOpen',
  frequency: ['Mon'],
  completed: false,
  startDate: '2026-11-01',
} as Habit;

describe('FormActions', () => {
  it('labels the submit button "Add habit" for a new habit', () => {
    renderActions();

    expect(screen.getByRole('button', { name: 'Add habit' })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('labels the submit button "Save Changes" for an existing habit', () => {
    renderActions(existing);

    expect(
      screen.getByRole('button', { name: 'Save Changes' }),
    ).toHaveAttribute('type', 'submit');
  });

  it('says "Adding…" while a new habit is being saved', () => {
    renderActions(undefined, true);

    expect(screen.getByRole('button', { name: 'Adding…' })).toBeDisabled();
  });
});
