// Covers confirming a habit's deletion: an iOS action sheet on phones, a dialog on wider screens.
// Both name the habit and offer Delete and Cancel; on a phone Cancel sits apart, at the bottom.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteHabitConfirmation from '../DeleteHabitConfirmation';
import { PHONE_QUERY } from '@shared/hooks/useIsPhone';
import type { Habit } from '@/features/habits/types/Habit';

const realMatchMedia = window.matchMedia;

function setPhone(isPhone: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    ...realMatchMedia(query),
    matches: query === PHONE_QUERY && isPhone,
  }));
}

const read = { id: '1', name: 'Read' } as Habit;

function renderConfirmation(habit: Habit | undefined) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <DeleteHabitConfirmation
      habit={habit}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel };
}

describe.each([
  ['on a phone', true],
  ['on a wider screen', false],
])('DeleteHabitConfirmation %s', (_, isPhone) => {
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  it('names the habit it is about to delete', () => {
    setPhone(isPhone);
    renderConfirmation(read);

    expect(
      screen.getByRole('alertdialog', { name: 'Delete Habit' }),
    ).toHaveTextContent('“Read”');
  });

  it('deletes on Delete', async () => {
    setPhone(isPhone);
    const { onConfirm } = renderConfirmation(read);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('keeps the habit on Cancel', async () => {
    setPhone(isPhone);
    const { onConfirm, onCancel } = renderConfirmation(read);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('dims the page behind it without blurring it, as iOS does', () => {
    setPhone(isPhone);
    renderConfirmation(read);

    const overlay = document.querySelector(
      '[data-slot="alert-dialog-overlay"]',
    );
    expect(overlay?.className).toMatch(/\bbg-black\/40\b/);
    expect(overlay?.className).not.toMatch(/backdrop-blur/);
  });

  it('shows nothing without a habit to delete', () => {
    setPhone(isPhone);
    renderConfirmation(undefined);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

describe('DeleteHabitConfirmation on a phone, as an action sheet', () => {
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  it('puts Cancel last, apart from the Delete choice, as iOS does', () => {
    setPhone(true);
    renderConfirmation(read);

    const [first, last] = screen.getAllByRole('button');
    expect(first).toHaveAccessibleName('Delete');
    expect(last).toHaveAccessibleName('Cancel');
    expect(last.parentElement).not.toBe(first.parentElement);
  });
});
