// End-to-end checks of the habit flows a signed-in user relies on, through the real API and D1.
// Each test creates a habit with a name of its own, so no test depends on another's data.

import { expect, test } from '@playwright/test';
import { addHabit } from './addHabit';

/** A habit name no other test or run uses. */
const uniqueName = (label: string) => `${label} ${Date.now()}`;

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

test('highlights missing required fields when submitting an incomplete habit', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Add Habit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add New Habit' });

  await dialog.getByRole('button', { name: 'Add habit' }).click();

  // Submitting empty keeps the dialog open and highlights the missing sections.
  await expect(dialog).toBeVisible();
  const nameInput = dialog.getByLabel('Name');
  await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  await expect(nameInput).toHaveAccessibleDescription('Enter a habit name');
  await expect(nameInput).toBeInViewport();
  await expect(dialog.locator('[data-invalid="true"]')).toHaveCount(3);

  // Filling the name clears its invalid state right away.
  await nameInput.fill('Meditate');
  await expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.getByText('Enter a habit name')).toHaveCount(0);
  await expect(dialog.locator('[data-invalid="true"]')).toHaveCount(2);
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
  const row = page
    .getByRole('list', { name: 'Habits' })
    .getByRole('listitem')
    .filter({ hasText: name });
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: `Delete ${name}` }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Delete Habit' });
  const deleted = page.waitForResponse(
    (response) =>
      response.request().method() === 'DELETE' &&
      /\/api\/v1\/habits\/[^/]+$/.test(new URL(response.url()).pathname) &&
      response.ok(),
  );
  await confirm.getByRole('button', { name: 'Delete' }).click();

  await expect(row).toHaveCount(0);
  await deleted;

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

test('keeps the day arrows in place when a day is picked right after closing a dialog', async ({
  page,
}) => {
  await addHabit(page, uniqueName('Stretch'));
  const previous = page.getByRole('button', { name: 'Previous Date' });
  const before = await previous.boundingBox();

  // Closing the dialog hands focus back to the page while the click lands,
  // which once scrolled the clipped Tracker card sideways.
  await page.getByRole('button', { name: 'Add Habit', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Add New Habit' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await previous.click();
  await expect(
    page.getByRole('button', { name: 'Back to Today' }),
  ).toBeVisible();

  const after = await previous.boundingBox();
  expect(after?.x).toBe(before?.x);
});
