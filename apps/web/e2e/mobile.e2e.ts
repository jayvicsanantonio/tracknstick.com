// End-to-end checks of the phone layout: bottom tab bar, bottom-sheet dialog, habit cards and chat.
// Runs at an iPhone-sized viewport against the real API and D1, signed in as the test user.

import { expect, test } from '@playwright/test';

const VIEWPORT = { width: 390, height: 844 };
test.use({ viewport: VIEWPORT, hasTouch: true, isMobile: true });

const EVERY_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('moves between screens with the bottom tab bar', async ({ page }) => {
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  await expect(tabs).toBeVisible();
  // The header's own navigation is for wider screens only.
  await expect(
    page.getByRole('link', { name: 'Habits Overview' }),
  ).toBeHidden();

  await tabs.getByRole('link', { name: 'Habits' }).click();
  await expect(page).toHaveURL(/\/habits$/);
  await expect(tabs.getByRole('link', { name: 'Habits' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await tabs.getByRole('link', { name: 'Progress' }).click();
  await expect(page).toHaveURL(/\/progress$/);

  await tabs.getByRole('link', { name: 'Tracker' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('adds a habit in a bottom sheet and deletes it from its card', async ({
  page,
}) => {
  const name = `Stretch ${Date.now()}`;
  const tabs = page.getByRole('navigation', { name: 'Primary' });

  await tabs.getByRole('button', { name: 'Add Habit' }).click();
  const sheet = page.getByRole('dialog', { name: 'Add New Habit' });
  await expect(sheet).toBeVisible();
  // A bottom sheet: anchored to the bottom edge, full width, with its
  // submit button on screen without scrolling.
  await expect
    .poll(async () => {
      const box = await sheet.boundingBox();
      return box && [Math.round(box.x), Math.round(box.y + box.height)];
    })
    .toEqual([0, VIEWPORT.height]);
  const submit = sheet.getByRole('button', { name: 'Add habit' });
  await expect(submit).toBeInViewport();

  await sheet.getByLabel('Name').fill(name);
  const activity = page.getByRole('radio', { name: 'Activity' });
  await sheet.locator('label', { has: activity }).click();
  for (const day of EVERY_DAY) {
    await sheet.getByRole('button', { name: day, exact: true }).click();
  }
  await submit.click();
  await expect(sheet).toBeHidden();

  await tabs.getByRole('link', { name: 'Habits' }).click();
  const card = page
    .getByRole('list', { name: 'Habits' })
    .getByRole('listitem')
    .filter({ hasText: name });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Daily');

  await card.getByRole('button', { name: `Delete ${name}` }).click();
  await page
    .getByRole('alertdialog', { name: 'Delete Habit' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(card).toHaveCount(0);
});

test('opens the habit coach from the tab bar and closes it', async ({
  page,
}) => {
  // On phones the header's Coach button gives way to the tab bar's Coach tab.
  await expect(
    page
      .getByRole('toolbar', { name: 'User actions' })
      .getByRole('button', { name: 'Coach' }),
  ).toBeHidden();
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  await tabs.getByRole('button', { name: 'Coach' }).click();

  const close = page.getByRole('button', { name: 'Close chat' });
  await expect(close).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Ask the habit coach' }),
  ).toBeInViewport();

  await close.click();
  await expect(close).toBeHidden();
  await expect(tabs).toBeVisible();
});
