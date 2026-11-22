// Covers FrequencySelector quick presets (Daily, Weekdays, Weekends) and individual day toggles.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FrequencySelector from '../FrequencySelector';

describe('FrequencySelector', () => {
  it('applies quick frequency presets with one tap', async () => {
    const onChange = vi.fn();
    render(
      <FrequencySelector selectedDays={[]} onFrequencyChange={onChange} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Daily' }));
    expect(onChange).toHaveBeenLastCalledWith([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Weekdays' }));
    expect(onChange).toHaveBeenLastCalledWith([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Weekends' }));
    expect(onChange).toHaveBeenLastCalledWith(['Sun', 'Sat']);
  });
});
