// End-to-end checks of the native iOS phone layout:
// iOS 26 Liquid Glass tab bar, draggable Add Habit sheet with top-bar Save,
// inset grouped Habits list with Action Sheet delete, and full-bleed Coach.

import { expect, test } from '@playwright/test';

const VIEWPORT = { width: 390, height: 844 };
test.use({ viewport: VIEWPORT, hasTouch: true, isMobile: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('moves between screens with the Liquid Glass tab bar', async ({
  page,
}) => {
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  await expect(tabs).toBeVisible();
  // The desktop header navigation is hidden on phones.
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

test('adds a habit in an iOS bottom sheet and deletes it via Action Sheet', async ({
  page,
}) => {
  const name = `Stretch ${Date.now()}`;
  const tabs = page.getByRole('navigation', { name: 'Primary' });

  await tabs.getByRole('button', { name: 'Add Habit' }).click();
  const sheet = page.getByRole('dialog', { name: 'Add New Habit' });
  await expect(sheet).toBeVisible();

  // Bottom-anchored sheet whose top-bar Add button stays visible without scrolling.
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
  await sheet.getByRole('button', { name: 'Daily' }).click();
  await submit.click();
  await expect(sheet).toBeHidden();

  await tabs.getByRole('link', { name: 'Habits' }).click();
  const row = page
    .getByRole('list', { name: 'Habits' })
    .getByRole('listitem')
    .filter({ hasText: name });
  await expect(row).toBeVisible();
  await expect(row).toContainText('Daily');

  // Swipe the habit card left to uncover the trailing red Delete action.
  const box = await row.boundingBox();
  if (!box) throw new Error('Habit row did not render');
  await page.mouse.move(box.x + box.width - 24, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 24, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();

  await row.getByRole('button', { name: `Delete ${name}` }).click();
  await page
    .getByRole('alertdialog', { name: 'Delete Habit' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(row).toHaveCount(0);
});

test('opens the Coach page from the tab bar with composer above it', async ({
  page,
}) => {
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  const coach = tabs.getByRole('link', { name: 'Coach' });

  await coach.click();

  await expect(page).toHaveURL(/\/coach$/);
  await expect(coach).toHaveAttribute('aria-current', 'page');

  const textbox = page.getByRole('textbox', { name: 'Ask the habit coach' });
  await expect(textbox).toBeInViewport();
  const textboxBox = await textbox.boundingBox();
  const tabsBox = await tabs.boundingBox();
  expect(textboxBox).not.toBeNull();
  expect(tabsBox).not.toBeNull();
  if (!textboxBox || !tabsBox) return;
  expect(textboxBox.y + textboxBox.height).toBeLessThanOrEqual(tabsBox.y);
});
