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
  // Scrolling the fields leaves the sheet's title and buttons where they are.
  await sheet.getByLabel('Name').hover();
  await page.mouse.wheel(0, 1000);
  await expect(
    sheet.getByRole('heading', { name: 'Add New Habit' }),
  ).toBeInViewport({ ratio: 1 });
  await expect(submit).toBeInViewport({ ratio: 1 });
  // The text fields share one height, and each field's label sits clear of
  // the field above it.
  const fields = [
    sheet.getByLabel('Name'),
    sheet.getByRole('searchbox', { name: 'Search icons' }),
    sheet.getByLabel('Start Date'),
    sheet.getByLabel('End Date (Optional)'),
  ];
  const heights = await Promise.all(
    fields.map(async (field) => (await field.boundingBox())?.height),
  );
  expect(new Set(heights).size).toBe(1);
  const startBox = await sheet.getByLabel('Start Date').boundingBox();
  const endLabelBox = await sheet
    .locator('label', { hasText: 'End Date (Optional)' })
    .boundingBox();
  expect(startBox).not.toBeNull();
  expect(endLabelBox).not.toBeNull();
  if (!startBox || !endLabelBox) return;
  expect(endLabelBox.y - (startBox.y + startBox.height)).toBeGreaterThanOrEqual(
    12,
  );

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

test('opens the Coach page from the tab bar', async ({ page }) => {
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  const coach = tabs.getByRole('link', { name: 'Coach' });

  await coach.click();

  await expect(page).toHaveURL(/\/coach$/);
  await expect(coach).toHaveAttribute('aria-current', 'page');
  // The message box sits above the tab bar, not under it.
  const textbox = page.getByRole('textbox', { name: 'Ask the habit coach' });
  await expect(textbox).toBeInViewport();
  const textboxBox = await textbox.boundingBox();
  const tabsBox = await tabs.boundingBox();
  expect(textboxBox).not.toBeNull();
  expect(tabsBox).not.toBeNull();
  if (!textboxBox || !tabsBox) return;
  expect(textboxBox.y + textboxBox.height).toBeLessThanOrEqual(tabsBox.y);
});
