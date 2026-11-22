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

test('keeps the Add Habit title and buttons on screen in a short window', async ({
  page,
}) => {
  // A small laptop's window, too short for the whole form.
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.getByRole('button', { name: 'Add Habit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add New Habit' });
  const title = dialog.getByRole('heading', { name: 'Add New Habit' });
  const submit = dialog.getByRole('button', { name: 'Add habit' });
  await expect(submit).toBeInViewport({ ratio: 1 });

  // Only the fields between the title and the buttons scroll.
  await dialog.getByLabel('Name').hover();
  await page.mouse.wheel(0, 1000);
  await expect(dialog.getByRole('button', { name: 'Sat' })).toBeInViewport({
    ratio: 1,
  });
  await expect(title).toBeInViewport({ ratio: 1 });
  await expect(submit).toBeInViewport({ ratio: 1 });
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

test('opens the Coach page from the header navigation', async ({ page }) => {
  await page.goto('/');
  const coach = page.getByRole('link', { name: 'Habit Coach' });

  await coach.click();

  await expect(page).toHaveURL(/\/coach$/);
  await expect(coach).toHaveAttribute('aria-current', 'page');
  // The page heading is for screen readers, as on Habits and Progress; the
  // card header shows the title and subtitle.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Habit Coach' }),
  ).toBeAttached();
  await expect(
    page.getByText('Advice grounded in Atomic Habits by James Clear'),
  ).toBeVisible();
  // The message box is on screen without scrolling the page.
  await expect(
    page.getByRole('textbox', { name: 'Ask the habit coach' }),
  ).toBeInViewport();
});
