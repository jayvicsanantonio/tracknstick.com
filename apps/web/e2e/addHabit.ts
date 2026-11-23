// Adds a habit through the Add Habit dialog, as a user would, for the end-to-end tests.
// Shared by the tests that need a habit on the Tracker before they can check it.

import { expect, type Page } from '@playwright/test';

const EVERY_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Adds a habit due every day, starting today (the form's default), through
 * the Add Habit dialog.
 */
export async function addHabit(page: Page, name: string) {
  // The header's button. exact: the empty state has an "Add habit" button
  // too while the user has no habits.
  await page.getByRole('button', { name: 'Add Habit', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: 'Add New Habit' });
  await dialog.getByLabel('Name').fill(name);
  // The radio is visually hidden under its icon, so click the choice that
  // holds it, as a user would.
  const activity = page.getByRole('radio', { name: 'Activity' });
  await dialog.locator('label', { has: activity }).click();
  await expect(dialog.getByRole('radio', { name: 'Activity' })).toBeChecked();
  for (const day of EVERY_DAY) {
    await dialog.getByRole('button', { name: day, exact: true }).click();
  }
  await dialog.getByRole('button', { name: 'Add habit' }).click();

  await expect(dialog).toBeHidden();
}
