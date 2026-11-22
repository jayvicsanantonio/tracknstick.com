// Covers the habit dialog's two forms: an iOS-style sheet on phones, a centred dialog on wider screens.
// The sheet comes up from the bottom and can be dragged away; both close on Escape.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HabitDialog from '../HabitDialog';
import { DialogDescription, DialogTitle } from '@shared/components/ui/dialog';
import { PHONE_QUERY } from '@shared/hooks/useIsPhone';

const realMatchMedia = window.matchMedia;

/** Makes the screen phone-sized, or wider, for every media query asked. */
function setPhone(isPhone: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    ...realMatchMedia(query),
    matches: query === PHONE_QUERY && isPhone,
  }));
}

function renderDialog(toggleIsOpen = vi.fn()) {
  render(
    <HabitDialog isOpen toggleIsOpen={toggleIsOpen}>
      <DialogTitle>Add New Habit</DialogTitle>
      <DialogDescription>Add a new habit to your list.</DialogDescription>
      <p>Form fields</p>
    </HabitDialog>,
  );
  return toggleIsOpen;
}

describe('HabitDialog', () => {
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  describe('on a phone', () => {
    it('is a sheet that comes up from the bottom and follows a drag', () => {
      setPhone(true);
      renderDialog();

      const sheet = screen.getByRole('dialog', { name: 'Add New Habit' });
      expect(sheet).toHaveAttribute('data-vaul-drawer-direction', 'bottom');
      expect(sheet).toHaveTextContent('Form fields');
    });

    it('shows a grabber to drag it by', () => {
      setPhone(true);
      renderDialog();

      const sheet = screen.getByRole('dialog', { name: 'Add New Habit' });
      expect(sheet.querySelector('[data-vaul-handle]')).not.toBeNull();
    });

    it('closes on Escape', async () => {
      setPhone(true);
      const toggleIsOpen = renderDialog();

      await userEvent.keyboard('{Escape}');

      expect(toggleIsOpen).toHaveBeenCalled();
    });
  });

  describe('on a wider screen', () => {
    it('dims the page behind it without blurring it, as iOS does', () => {
      setPhone(false);
      renderDialog();

      const overlay = document.querySelector('[data-slot="dialog-overlay"]');
      expect(overlay?.className).toMatch(/\bbg-black\/40\b/);
      expect(overlay?.className).not.toMatch(/backdrop-blur/);
    });

    it('is a dialog in the middle of the screen, not a sheet', () => {
      setPhone(false);
      renderDialog();

      const dialog = screen.getByRole('dialog', { name: 'Add New Habit' });
      expect(dialog).not.toHaveAttribute('data-vaul-drawer-direction');
      expect(dialog).toHaveTextContent('Form fields');
    });

    it('closes on Escape', async () => {
      setPhone(false);
      const toggleIsOpen = renderDialog();

      await userEvent.keyboard('{Escape}');

      expect(toggleIsOpen).toHaveBeenCalled();
    });
  });
});
