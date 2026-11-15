// Covers the habit form's icon choices: a radio group named by its label, one named radio per icon.
// Each icon is drawn as a picture only, so its name has to come from the radio itself.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconPicker from '../IconPicker';
import HabitsIcons from '@/icons/habits';

describe('IconPicker', () => {
  it('names the group after its label', () => {
    render(<IconPicker selectedIcon={undefined} onIconChange={vi.fn()} />);

    expect(
      screen.getByRole('radiogroup', { name: 'Icon' }),
    ).toBeInTheDocument();
  });

  it('offers one radio per icon, named after it', () => {
    render(<IconPicker selectedIcon={undefined} onIconChange={vi.fn()} />);

    expect(screen.getAllByRole('radio')).toHaveLength(
      Object.keys(HabitsIcons).length,
    );
    expect(screen.getByRole('radio', { name: 'Activity' })).toBeInTheDocument();
  });

  it('marks the selected icon as checked', () => {
    render(<IconPicker selectedIcon="Activity" onIconChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: 'Activity' })).toBeChecked();
  });

  it('reports the icon picked by its name', async () => {
    const onIconChange = vi.fn();
    render(<IconPicker selectedIcon={undefined} onIconChange={onIconChange} />);

    await userEvent.click(screen.getByRole('radio', { name: 'Activity' }));

    expect(onIconChange).toHaveBeenCalledWith('Activity');
  });
});
