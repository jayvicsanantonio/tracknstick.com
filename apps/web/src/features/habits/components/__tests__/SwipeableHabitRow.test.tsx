import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SwipeableHabitRow from '../SwipeableHabitRow';
import type { Habit } from '@/features/habits/types/Habit';

const HABIT = {
  id: 'habit-1',
  name: 'Stretch',
  icon: 'Activity',
  frequency: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  completed: false,
  startDate: '2026-11-01',
} as Habit;

describe('SwipeableHabitRow', () => {
  it('opens Edit on a normal tap', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <ul>
        <SwipeableHabitRow
          habit={HABIT}
          frequencyLabelText="Daily"
          startDateText="11/1/2026"
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </ul>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Edit Stretch' }));
    expect(onEdit).toHaveBeenCalledWith(HABIT);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('suppresses the synthetic click fired after a horizontal swipe', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <ul>
        <SwipeableHabitRow
          habit={HABIT}
          frequencyLabelText="Daily"
          startDateText="11/1/2026"
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </ul>,
    );

    const editButton = screen.getByRole('button', { name: 'Edit Stretch' });
    // jsdom does not implement PointerEvent, so MouseEvent carries clientX.
    fireEvent(
      editButton,
      new MouseEvent('pointerdown', { bubbles: true, clientX: 320 }),
    );
    fireEvent(
      editButton,
      new MouseEvent('pointermove', { bubbles: true, clientX: 180 }),
    );
    fireEvent(
      editButton,
      new MouseEvent('pointerup', { bubbles: true, clientX: 180 }),
    );
    fireEvent.click(editButton);

    expect(onEdit).not.toHaveBeenCalled();

    // A subsequent normal tap still works after pointerDown resets the guard.
    fireEvent(
      editButton,
      new MouseEvent('pointerdown', { bubbles: true, clientX: 200 }),
    );
    fireEvent(
      editButton,
      new MouseEvent('pointerup', { bubbles: true, clientX: 200 }),
    );
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('invokes onDelete when the trailing Delete action is clicked', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <ul>
        <SwipeableHabitRow
          habit={HABIT}
          frequencyLabelText="Daily"
          startDateText="11/1/2026"
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </ul>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete Stretch' }),
    );
    expect(onDelete).toHaveBeenCalledWith(HABIT);
    expect(onEdit).not.toHaveBeenCalled();
  });
});
