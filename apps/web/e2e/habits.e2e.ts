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

  // The button turns at once, before the API has saved anything; a reload
  // while the request is still in flight would cancel it.
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      /\/api\/v1\/habits\/[^/]+\/trackers$/.test(
        new URL(response.url()).pathname,
      ) &&
      response.ok(),
  );
  await page.getByRole('button', { name: `Mark ${name} as complete` }).click();

  const completed = page.getByRole('button', {
    name: `Mark ${name} as incomplete`,
  });
  await expect(completed).toHaveAttribute('aria-pressed', 'true');
  await saved;

  await page.reload();
  await expect(completed).toHaveAttribute('aria-pressed', 'true');
});

test('deletes a habit from the habits overview', async ({ page }) => {
  const name = uniqueName('Stretch');
  await addHabit(page, name);

  await page.getByRole('link', { name: 'Habits Overview' }).click();
  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: `Delete ${name}` }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Delete Habit' });
  await confirm.getByRole('button', { name: 'Delete' }).click();

  await expect(row).toHaveCount(0);

  await page.getByRole('link', { name: 'Daily Tracker' }).click();
  await expect(
    page.getByRole('button', { name: `Mark ${name} as complete` }),
  ).toHaveCount(0);
});

test('opens the habit coach while a toast is showing', async ({ page }) => {
  const name = uniqueName('Journal');
  await addHabit(page, name);
  // Adding a habit announces it in a toast at the bottom right, beside the
  // chat button.
  await expect(
    page.getByText(`Habit "${name}" added successfully.`, { exact: true }),
  ).toBeVisible();

  // The toast stays about 5s; a click that waited for it to leave would
  // still pass, so it gets 2s, while the toast is up.
  await page
    .getByRole('button', { name: 'Open chat' })
    .click({ timeout: 2_000 });

  await expect(
    page.getByRole('heading', { name: 'Habit Coach' }),
  ).toBeVisible();
});
