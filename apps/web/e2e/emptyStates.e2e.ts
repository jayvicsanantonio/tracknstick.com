// End-to-end checks of what a brand-new account sees on each page, and of starting from a starter habit and its first achievement.
// Needs the test user to have no habits, so it runs first of the signed-in files (they run in name order) and deletes what it adds.

import { expect, test } from '@playwright/test';

const STARTER = 'Drink water';

test('guides a new account from an empty Tracker to its first habit', async ({
  page,
}) => {
  // The Tracker, Habits and Progress each open on a next step, not on zeros.
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'No habits yet' }),
  ).toBeVisible();
  await expect(
    page.getByRole('list', { name: 'Starter habits' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /ask the coach/i }),
  ).toHaveAttribute('href', '/coach');

  await page.goto('/habits');
  await expect(
    page.getByRole('heading', { name: 'No habits yet' }),
  ).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveCount(0);

  await page.goto('/progress');
  await expect(
    page.getByRole('heading', { name: 'Your progress shows up here' }),
  ).toBeVisible();

  await page.goto('/coach');
  await expect(
    page.getByRole('button', { name: /Help me pick my first habit/ }),
  ).toBeVisible();

  // A starter habit opens the Add dialog filled in, ready to save.
  await page.goto('/');
  await page.getByRole('button', { name: `Start with ${STARTER}` }).click();
  const dialog = page.getByRole('dialog', { name: 'Add New Habit' });
  await expect(dialog.getByLabel('Name')).toHaveValue(STARTER);
  await dialog.getByRole('button', { name: 'Add habit' }).click();
  await expect(dialog).toBeHidden();

  // The first habit earns the first achievement, celebrated in a sheet with
  // its place on the habits track.
  const celebration = page.getByRole('dialog', { name: 'First Step' });
  await expect(celebration).toContainText('Achievement earned');
  await expect(celebration).toContainText('Level 1 of 5 on your habits track');
  await celebration.getByRole('button', { name: 'Keep going' }).click();
  await expect(celebration).toBeHidden();
  await expect(
    page.getByRole('button', { name: `Mark ${STARTER} as complete` }),
  ).toBeVisible();

  // The day before it started has nothing due, and points back to today.
  await page.getByRole('button', { name: 'Previous Date' }).click();
  await expect(
    page.getByRole('heading', { name: 'Nothing scheduled' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Rest day: nothing to check off' }),
  ).toBeVisible();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  await page.getByRole('button', { name: `Go to ${today}` }).click();
  await expect(
    page.getByRole('button', { name: `Mark ${STARTER} as complete` }),
  ).toBeVisible();

  // With a habit but no check-in, Progress points to the Tracker.
  await page.goto('/progress');
  await expect(
    page.getByRole('heading', { name: 'Check off your first habit' }),
  ).toBeVisible();

  // Leaves the account empty again for the files that follow.
  await page.goto('/habits');
  const row = page
    .getByRole('list', { name: 'Habits', exact: true })
    .getByRole('listitem')
    .filter({ hasText: STARTER });
  await row.getByRole('button', { name: `Delete ${STARTER}` }).click();
  const deleted = page.waitForResponse(
    (response) =>
      response.request().method() === 'DELETE' &&
      /\/api\/v1\/habits\/[^/]+$/.test(new URL(response.url()).pathname) &&
      response.ok(),
  );
  await page
    .getByRole('alertdialog', { name: 'Delete Habit' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(row).toHaveCount(0);
  await deleted;
});
