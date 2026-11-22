// End-to-end checks of the phone layout: bottom tab bar, bottom-sheet dialog, habit cards and chat.
// Runs at an iPhone-sized viewport against the real API and D1, signed in as the test user.

import { expect, test, type Locator, type Page } from '@playwright/test';

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

test('adds a habit in a bottom sheet and deletes it with a swipe', async ({
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
  const row = page
    .getByRole('list', { name: 'Habits' })
    .getByRole('listitem')
    .filter({ hasText: name });
  await expect(row).toBeVisible();
  await expect(row).toContainText('Daily');

  await swipeOpen(page, row);
  await row.getByRole('button', { name: `Delete ${name}` }).click();
  await page
    .getByRole('alertdialog', { name: 'Delete Habit' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(row).toHaveCount(0);
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

/** Adds a habit due every day from the tab bar's Add button, and waits for the sheet to close. */
async function addDailyHabit(page: Page, name: string) {
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  await tabs.getByRole('button', { name: 'Add Habit' }).click();
  const sheet = page.getByRole('dialog', { name: 'Add New Habit' });
  await sheet.getByLabel('Name').fill(name);
  const activity = page.getByRole('radio', { name: 'Activity' });
  await sheet.locator('label', { has: activity }).click();
  for (const day of EVERY_DAY) {
    await sheet.getByRole('button', { name: day, exact: true }).click();
  }
  await sheet.getByRole('button', { name: 'Add habit' }).click();
  await expect(sheet).toBeHidden();
}

/** Swipes a row of the Habits list left, as a finger would, to reveal its Delete button. */
async function swipeOpen(page: Page, row: Locator) {
  const box = await row.boundingBox();
  if (!box) throw new Error('The row is not on screen');
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width - 40, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 200, y, { steps: 10 });
  await page.mouse.up();
}

/** Deletes the habit from its row on the Habits tab. */
async function deleteHabit(page: Page, name: string) {
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  await tabs.getByRole('link', { name: 'Habits' }).click();
  const row = page
    .getByRole('list', { name: 'Habits' })
    .getByRole('listitem')
    .filter({ hasText: name });
  await swipeOpen(page, row);
  await row.getByRole('button', { name: `Delete ${name}` }).click();
  await page
    .getByRole('alertdialog', { name: 'Delete Habit' })
    .getByRole('button', { name: 'Delete' })
    .click();
  await expect(row).toHaveCount(0);
}

test('answers taps as a native app does: no grey flash, zoom wait or copy menu', async ({
  page,
}) => {
  const tab = page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Habits' });

  const style = await tab.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      tapHighlight: computed.getPropertyValue('-webkit-tap-highlight-color'),
      touchAction: computed.touchAction,
      userSelect: computed.userSelect,
    };
  });

  expect(style).toEqual({
    tapHighlight: 'rgba(0, 0, 0, 0)',
    touchAction: 'manipulation',
    userSelect: 'none',
  });
});

test('keeps each tab where it was left, and opens a new one at its top', async ({
  page,
}) => {
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  await tabs.getByRole('link', { name: 'Progress' }).click();
  await expect(page).toHaveURL(/\/progress$/);
  // Tall enough to scroll on a phone once loaded: the calendar, chart and
  // achievements.
  await expect(
    page.getByRole('status', { name: /^Current streak/ }),
  ).toBeVisible();
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo(0, 400));
      return page.evaluate(() => window.scrollY);
    })
    .toBe(400);

  await tabs.getByRole('link', { name: 'Coach' }).click();
  await expect(page).toHaveURL(/\/coach$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await tabs.getByRole('link', { name: 'Progress' }).click();
  await expect(page).toHaveURL(/\/progress$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);

  // A second tap on the open tab takes it back to its top.
  await tabs.getByRole('link', { name: 'Progress' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('opens to the habits it showed last time, before the API has answered', async ({
  page,
}) => {
  const name = `Journal ${Date.now()}`;
  await addDailyHabit(page, name);
  const toggle = page.getByRole('button', { name: `Mark ${name} as complete` });
  await expect(toggle).toBeVisible();
  // Putting the app away saves what it shows.
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));

  // The next launch's habits request is held back until the test releases it.
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/habits?**', async (route) => {
    await held;
    await route.continue();
  });
  await page.reload();

  await expect(toggle).toBeVisible();
  release();
  // Lets the held request finish before the route goes.
  await page.unrouteAll({ behavior: 'wait' });

  await deleteHabit(page, name);
});

test('closes the habit sheet when it is dragged down, as an iOS sheet does', async ({
  page,
}) => {
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  await tabs.getByRole('button', { name: 'Add Habit' }).click();
  const sheet = page.getByRole('dialog', { name: 'Add New Habit' });
  await expect(sheet).toBeVisible();
  // Settled at the bottom edge before the drag starts.
  await expect
    .poll(async () => {
      const box = await sheet.boundingBox();
      return box && Math.round(box.y + box.height);
    })
    .toBe(VIEWPORT.height);

  const title = sheet.getByRole('heading', { name: 'Add New Habit' });
  const box = await title.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, VIEWPORT.height - 40, {
    steps: 12,
  });
  await page.mouse.up();

  await expect(sheet).toBeHidden();
});

test('opens a habit from its row, and a tap on a swiped row only shuts it', async ({
  page,
}) => {
  const name = `Floss ${Date.now()}`;
  await addDailyHabit(page, name);
  const tabs = page.getByRole('navigation', { name: 'Primary' });
  await tabs.getByRole('link', { name: 'Habits' }).click();
  const row = page
    .getByRole('list', { name: 'Habits' })
    .getByRole('listitem')
    .filter({ hasText: name });
  const open = row.getByRole('button', { name: `Edit ${name}` });

  const rowBox = await row.boundingBox();
  expect(rowBox).not.toBeNull();
  if (!rowBox) return;
  await swipeOpen(page, row);
  // The row has slid left, uncovering Delete.
  await expect
    .poll(async () => (await open.boundingBox())?.x ?? rowBox.x)
    .toBeLessThan(rowBox.x - 40);
  await open.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await open.click();
  await expect(page.getByRole('dialog', { name: name })).toBeVisible();
  await page.keyboard.press('Escape');

  await deleteHabit(page, name);
});

test('swipes between days on the Tracker, and back to today from the title', async ({
  page,
}) => {
  const name = `Stretch ${Date.now()}`;
  await addDailyHabit(page, name);
  const today = page.getByRole('heading', { name: 'Today' });
  await expect(today).toBeVisible();
  const toggle = page.getByRole('button', { name: `Mark ${name} as complete` });
  const box = await toggle.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  // A swipe left that starts on a habit turns the day, without ticking it.
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 200, y, { steps: 10 });
  await page.mouse.up();

  const tomorrow = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toLocaleDateString('en-US', { weekday: 'long' });
  const tomorrowTitle = page.getByRole('button', {
    name: tomorrow,
    description: 'Back to Today',
  });
  await expect(tomorrowTitle).toBeVisible();

  await tomorrowTitle.click();
  await expect(today).toBeVisible();
  await expect(toggle).toBeVisible();

  await deleteHabit(page, name);
});
