// Covers the habit form's date field: its visible label names the date input it sits over.
// A label tied to its input is read out by screen readers and focuses the input when tapped.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DatePickerField from '../DatePickerField';

describe('DatePickerField', () => {
  it('names its date input with its label', () => {
    render(
      <DatePickerField
        id="start-date"
        label="Start Date"
        selected={new Date(2026, 10, 21)}
        onChange={vi.fn()}
        isRequired
      />,
    );

    expect(screen.getByRole('textbox', { name: /^Start Date/ })).toHaveValue(
      '11/21/2026',
    );
  });
});
