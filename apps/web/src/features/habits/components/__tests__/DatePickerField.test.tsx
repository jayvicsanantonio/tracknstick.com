// Covers the habit form's date field: the phone's own date picker, named by its visible label.
// It reads and reports whole local days, and an emptied field reports no date.

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DatePickerField from '../DatePickerField';

function renderField(selected: Date | null, onChange = vi.fn()) {
  render(
    <DatePickerField
      id="start-date"
      label="Start Date"
      selected={selected}
      onChange={onChange}
      isRequired
    />,
  );
  return onChange;
}

describe('DatePickerField', () => {
  it("is the device's own date input, so iOS opens its native picker", () => {
    renderField(new Date(2026, 10, 21));

    expect(screen.getByLabelText(/^Start Date/)).toHaveAttribute(
      'type',
      'date',
    );
  });

  it('names its date input with its label and shows the chosen day', () => {
    renderField(new Date(2026, 10, 21));

    expect(screen.getByLabelText(/^Start Date/)).toHaveValue('2026-11-21');
  });

  it('reports the day picked as that day, in local time', () => {
    const onChange = renderField(new Date(2026, 10, 21));

    fireEvent.change(screen.getByLabelText(/^Start Date/), {
      target: { value: '2026-12-05' },
    });

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 11, 5));
  });

  it('reports no date when the field is emptied', () => {
    const onChange = vi.fn();
    render(
      <DatePickerField
        id="end-date"
        label="End Date (Optional)"
        selected={new Date(2026, 10, 30)}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('End Date (Optional)'), {
      target: { value: '' },
    });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('is required only when a date must be given', () => {
    renderField(null);

    expect(screen.getByLabelText(/^Start Date/)).toBeRequired();
    expect(screen.getByLabelText(/^Start Date/)).toHaveValue('');
  });

  it('gives a finger 44px to tap on a phone', () => {
    renderField(null);

    expect(screen.getByLabelText(/^Start Date/)).toHaveClass('h-11');
  });
});
