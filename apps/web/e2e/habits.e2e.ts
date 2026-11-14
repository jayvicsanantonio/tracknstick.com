// End-to-end checks of the habit flows a signed-in user relies on, through the real API and D1.
// Each test creates a habit with a name of its own, so no test depends on another's data.

import { expect, test, type Page } from '@playwright/test';

const EVERY_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** A habit name no other test or run uses. */
const uniqueName = (label: string) => `${label} ${Date.now()}`;

/**
 * Adds a habit due every day, starting today (the form's default), through
 * the Add Habit dialog.
 */
async function addHabit(page: Page, name: string) {
  await page.getByRole('button', { name: 'Add Habit' }).click();

  const dialog = page.getByRole('dialog', { name: 'Add New Habit' });
  await dialog.getByLabel('Name').fill(name);
  // The icon choices have no accessible names, so this picks one by its id.
  await dialog.locator('label:has(#Activity)').click();
  for (const day of EVERY_DAY) {
    await dialog.getByRole('button', { name: day, exact: true }).click();
  }
  await dialog.getByRole('button', { name: 'Save Changes' }).click();

  await expect(dialog).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test("adds a habit and shows it on today's tracker", async ({ page }) => {
  const name = uniqueName('Read');

  await addHabit(page, name);

  await expect(
    page.getByRole('button', { name: `Mark ${name} as complete` }),
  ).toBeVisible();
});

test('marks a habit complete and keeps it complete after a reload', async ({
  page,
}) => {
  const name = uniqueName('Walk');
  await addHabit(page, name);

  await page.getByRole('button', { name: `Mark ${name} as complete` }).click();

  const completed = page.getByRole('button', {
    name: `Mark ${name} as incomplete`,
  });
  await expect(completed).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(completed).toHaveAttribute('aria-pressed', 'true');
});

test('deletes a habit from the habits overview', async ({ page }) => {
  const name = uniqueName('Stretch');
  await addHabit(page, name);

  await page.getByRole('link', { name: 'Habits Overview' }).click();
  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toBeVisible();

  // The row's edit and delete buttons have no accessible names; delete is
  // the second.
  await row.getByRole('button').nth(1).click();
  const confirm = page.getByRole('alertdialog', { name: 'Delete Habit' });
  await confirm.getByRole('button', { name: 'Delete' }).click();

  await expect(row).toHaveCount(0);

  await page.getByRole('link', { name: 'Daily Tracker' }).click();
  await expect(
    page.getByRole('button', { name: `Mark ${name} as complete` }),
  ).toHaveCount(0);
});
